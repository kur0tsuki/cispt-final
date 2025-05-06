from django.contrib import admin
from .models import Ingredient, Recipe, RecipeIngredient, ProductionRecord, Product, Sale

# Register your models here.
admin.site.register(Ingredient)
admin.site.register(Recipe) 
admin.site.register(RecipeIngredient)
admin.site.register(ProductionRecord)
admin.site.register(Product)
admin.site.register(Sale)