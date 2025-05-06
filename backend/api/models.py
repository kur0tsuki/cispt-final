from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import datetime

class Ingredient(models.Model):
    name = models.CharField(max_length=100, unique=True)
    quantity = models.FloatField(help_text="Available quantity")
    unit = models.CharField(max_length=20)
    min_threshold = models.FloatField(default=0, help_text="Minimum threshold for low stock warning")
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=5, default=0)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"
    
    @property
    def is_low_stock(self):
        return self.quantity <= self.min_threshold


class Recipe(models.Model):
    name = models.CharField(max_length=100, unique=True)
    instructions = models.TextField(blank=True)
    preparation_time = models.IntegerField(default=0, help_text="Preparation time in minutes")
    ingredients = models.ManyToManyField(Ingredient, through='RecipeIngredient')
    image = models.ImageField(upload_to='recipe_images/', null=True, blank=True)
    prepared_quantity = models.FloatField(default=0)  # NEW
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def can_make(self):
        """Check if this recipe can be made with current ingredients"""
        for requirement in self.recipeingredient_set.all():
            if requirement.ingredient.quantity < requirement.quantity:
                return False
        return True
    
    @property
    def max_portions(self):
        """Calculate maximum portions that can be made with current ingredients"""
        if not self.recipeingredient_set.exists():
            return 0.0
        
        portions = []
        for requirement in self.recipeingredient_set.all():
            if requirement.quantity <= 0:
                continue
                
            available_portions = requirement.ingredient.quantity / requirement.quantity
            if available_portions > 0:
                portions.append(available_portions)
        
        if not portions:
            return 0.0
        
        return max(0.0, min(portions))
    
    @property
    def cost(self):
        """Calculate the cost of making this recipe once"""
        total_cost = 0
        for requirement in self.recipeingredient_set.all():
            total_cost += requirement.quantity * float(requirement.ingredient.cost_per_unit)
        return total_cost


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.FloatField()
    
    class Meta:
        unique_together = ('recipe', 'ingredient')
    
    def __str__(self):
        return f"{self.recipe}: {self.quantity} {self.ingredient.unit} of {self.ingredient.name}"
    
    def save(self, *args, **kwargs):
        if not self.id: 
            self.recipe.prepared_quantity += self.quantity
            self.recipe.save()
        super().save(*args, **kwargs)


class ProductionRecord(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    quantity = models.FloatField(default=1)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.quantity} {self.recipe.name}(s) on {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        if not self.id:  # Only on creation
            print(f"Before production: {self.recipe.name} prepared_quantity = {self.recipe.prepared_quantity}")
            self.recipe.prepared_quantity += self.quantity
            self.recipe.save()
            print(f"After production: {self.recipe.name} prepared_quantity = {self.recipe.prepared_quantity}")
        super().save(*args, **kwargs)
    
class Product(models.Model):
    recipe = models.ForeignKey('Recipe', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, help_text="Product/menu item name (can differ from recipe name)")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} (${self.price})"
    
    @property
    def cost(self):
        """Get production cost from the recipe"""
        return self.recipe.cost
    
    @property
    def profit_margin(self):
        """Calculate profit margin percentage"""
        if self.cost == 0:
            return 100.0
        return float((self.price - Decimal(self.cost)) / self.price * 100)
    
    @property
    def profit(self):
        """Calculate profit per unit"""
        return float(self.price) - self.cost


class Sale(models.Model):
    """Individual sale record"""
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at time of sale")
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.quantity} {self.product.name}(s) @ ${self.unit_price} on {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def total_price(self):
        return self.quantity * self.unit_price
    
    @property
    def profit(self):
        """Calculate total profit for this sale using product's profit per unit"""
        unit_profit = self.product.profit
        return float(unit_profit * self.quantity)
    
    def save(self, *args, **kwargs):
        if not self.id:
            recipe = self.product.recipe
            print(f"Sale: Current prepared quantity for {recipe.name}: {recipe.prepared_quantity}")

            if recipe.prepared_quantity < self.quantity:
                raise ValidationError({
                    'quantity': f'Cannot sell {self.quantity} {self.product.name}(s). Only {recipe.prepared_quantity} prepared.'
                })

            recipe.prepared_quantity -= self.quantity
            recipe.save()
            print(f"Sale: After deduction, prepared quantity for {recipe.name}: {recipe.prepared_quantity}")

            if not self.unit_price:
                self.unit_price = self.product.price


            super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)
