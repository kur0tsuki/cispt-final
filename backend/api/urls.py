from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IngredientViewSet, RecipeViewSet, RecipeIngredientViewSet, ProductionRecordViewSet,ProductViewSet, SaleViewSet
)

router = DefaultRouter()
router.register(r'ingredients', IngredientViewSet)
router.register(r'recipes', RecipeViewSet)
router.register(r'recipe-ingredients', RecipeIngredientViewSet)
router.register(r'production-records', ProductionRecordViewSet)
router.register(r'products', ProductViewSet)
router.register(r'sales', SaleViewSet, basename='sale')

urlpatterns = [
    path('', include(router.urls)),
]