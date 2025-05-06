from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum, Count, F, ExpressionWrapper, DecimalField, Avg
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth, ExtractYear
from datetime import datetime, timedelta
from django.utils import timezone

from .models import Ingredient, Recipe, RecipeIngredient, ProductionRecord, Product, Sale
from .serializers import (
    IngredientSerializer, RecipeSerializer, 
    RecipeIngredientSerializer, ProductionRecordSerializer, ProductSerializer, SaleSerializer
)

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    
    @action(detail=True, methods=['post'])
    def restock(self, request, pk=None):
        ingredient = self.get_object()
        amount = float(request.data.get('amount', 0))
        
        if amount <= 0:
            return Response(
                {'error': 'Amount must be greater than zero'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ingredient.quantity += amount
        ingredient.save()
        
        return Response(IngredientSerializer(ingredient).data)


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    
    @action(detail=True, methods=['post'])
    def prepare(self, request, pk=None):
        recipe = self.get_object()
        
        try:
            quantity = float(request.data.get('quantity', 1))
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid quantity format. Please provide a number.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notes = request.data.get('notes', '')
        
        if quantity <= 0:
            return Response(
                {'error': 'Quantity must be greater than zero'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        max_possible = recipe.max_portions
        
        if quantity > max_possible:
            return Response(
                {'error': f'Cannot make {quantity} {recipe.name}(s). Maximum available: {max_possible:.2f}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            for requirement in recipe.recipeingredient_set.all():
                total_needed = requirement.quantity * quantity
                ingredient = requirement.ingredient
                ingredient.quantity -= total_needed
                ingredient.save()
                
            
            production = ProductionRecord.objects.create(
                recipe=recipe,
                quantity=quantity,
                notes=notes
            )
            recipe.prepared_quantity += quantity
            recipe.save()
        return Response({
            'message': f'Successfully produced {quantity} {recipe.name}(s)',
            'production': ProductionRecordSerializer(production).data
        })


class RecipeIngredientViewSet(viewsets.ModelViewSet):
    queryset = RecipeIngredient.objects.all()
    serializer_class = RecipeIngredientSerializer
   
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        for product in queryset:
            print(f"Product: {product.name}, prepared_quantity: {product.recipe.prepared_quantity}")
        return queryset


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    
    @action(detail=False, methods=['get'])
    def report(self, request):
        """Generate sales and profit report by time period"""
        try:
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')
            period = request.query_params.get('period', 'day') 

            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
            queryset = Sale.objects.filter(
                timestamp__date__gte=start_date,
                timestamp__date__lte=end_date
            )
            
            if period == 'day':
                trunc_function = TruncDate('timestamp')
                date_format = '%Y-%m-%d'
            elif period == 'week':
                trunc_function = TruncWeek('timestamp')
                date_format = 'Week of %Y-%m-%d'
            elif period == 'month':
                trunc_function = TruncMonth('timestamp')
                date_format = '%Y-%m'
            else:
                return Response(
                    {'error': 'Invalid period. Choose from: day, week, month'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            sales_by_period = queryset.annotate(
                period=trunc_function
            ).values('period').annotate(
                total_sales=Sum(F('quantity') * F('unit_price')),
                transactions=Count('id'),
                items_sold=Sum('quantity')
            ).order_by('period')

            result = []
            for period_data in sales_by_period:
                period_sales = queryset.filter(timestamp__date=period_data['period'])
                cost = sum(sale.quantity * float(sale.product.recipe.cost) for sale in period_sales)
                revenue = float(period_data['total_sales'] or 0)
                profit = revenue - cost

                result.append({
                    'period': period_data['period'].strftime(date_format),
                    'transactions': period_data['transactions'],
                    'total_sales': revenue,
                    'cost': cost,
                    'profit': profit,
                    'profit_margin': (profit / revenue * 100) if revenue > 0 else 0
                })

            return Response({
                'data': result
            })

        except (ValueError, TypeError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'An unexpected error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        try:
            today = timezone.now().date()
            week_ago = today - timedelta(days=7)

            sales = self.queryset

            today_sales = sales.filter(timestamp__date=today)
            today_revenue = today_sales.aggregate(
                revenue=Sum(F('quantity') * F('unit_price')),
                transactions=Count('id')
            )

            today_cost = sum(
                sale.quantity * float(sale.product.recipe.cost)
                for sale in today_sales
            )
            today_revenue_val = float(today_revenue['revenue'] or 0)
            today_profit = today_revenue_val - today_cost
            today_margin = (today_profit / today_revenue_val * 100) if today_revenue_val > 0 else 0

            week_sales = sales.filter(timestamp__date__gte=week_ago)
            week_revenue = week_sales.aggregate(
                revenue=Sum(F('quantity') * F('unit_price')),
                transactions=Count('id')
            )

            week_cost = sum(
                sale.quantity * float(sale.product.recipe.cost)
                for sale in week_sales
            )
            week_revenue_val = float(week_revenue['revenue'] or 0)
            week_profit = week_revenue_val - week_cost
            week_margin = (week_profit / week_revenue_val * 100) if week_revenue_val > 0 else 0

            last_week = timezone.now() - timedelta(days=7)
            chart_data = (
                Sale.objects.filter(timestamp__gte=last_week)
                .annotate(period=TruncDate('timestamp'))
                .values('period')
                .annotate(
                    total_sales=Sum(F('quantity') * F('unit_price')),
                    transactions=Count('id')
                )
                .order_by('period')
            )

            for day in chart_data:
                day_sales = Sale.objects.filter(timestamp__date=day['period'])
                cost = sum(
                    sale.quantity * float(sale.product.recipe.cost)
                    for sale in day_sales
                )
                day['profit'] = float(day['total_sales'] or 0) - cost

            return Response({
                'today': {
                    'revenue': today_revenue_val,
                    'profit': today_profit,
                    'profit_margin': today_margin,
                    'transactions': today_revenue['transactions'] or 0
                },
                'week': {
                    'revenue': week_revenue_val,
                    'profit': week_profit,
                    'profit_margin': week_margin,
                    'transactions': week_revenue['transactions'] or 0
                },
                'chart_data': list(chart_data)
            })

        except Exception as e:
            print(f"Dashboard error: {str(e)}")
            return Response(
                {'error': 'Error generating dashboard metrics'},
                status=500
            )