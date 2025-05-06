from rest_framework import serializers
from .models import Ingredient, Recipe, RecipeIngredient, ProductionRecord, Product, Sale

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'quantity', 'unit', 'min_threshold', 'cost_per_unit', 'is_low_stock']


class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit', read_only=True)
    
    class Meta:
        model = RecipeIngredient
        fields = ['id', 'ingredient', 'ingredient_name', 'ingredient_unit', 'quantity']


class RecipeSerializer(serializers.ModelSerializer):
    ingredients_detail = RecipeIngredientSerializer(source='recipeingredient_set', many=True, read_only=True)
    recipe_ingredients = RecipeIngredientSerializer(write_only=True, many=True, required=False)
    cost_per_serving = serializers.FloatField(read_only=True)
    can_make = serializers.BooleanField(read_only=True)
    max_portions = serializers.FloatField(read_only=True)
    cost = serializers.FloatField(read_only=True)
    prepared_quantity = serializers.FloatField(read_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id', 'name', 'instructions', 'preparation_time', 'image',
            'ingredients_detail', 'recipe_ingredients',  # <== recipe_ingredients now writable
            'can_make', 'max_portions', 'cost','prepared_quantity','cost_per_serving',
        ]

    def create(self, validated_data):
        ingredients_data = validated_data.pop('recipe_ingredients', [])
        recipe = Recipe.objects.create(**validated_data)

        for item in ingredients_data:
            RecipeIngredient.objects.create(
                recipe=recipe,
                ingredient=item['ingredient'],
                quantity=item['quantity']
            )
        return recipe

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('recipe_ingredients', None)
        instance.name = validated_data.get('name', instance.name)
        instance.instructions = validated_data.get('instructions', instance.instructions)
        instance.preparation_time = validated_data.get('preparation_time', instance.preparation_time)
        instance.image = validated_data.get('image', instance.image)
        instance.save()

        if ingredients_data is not None:
            # Clear and recreate the ingredients
            instance.recipeingredient_set.all().delete()
            for item in ingredients_data:
                RecipeIngredient.objects.create(
                    recipe=instance,
                    ingredient=item['ingredient'],
                    quantity=item['quantity']
                )

        return instance
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['cost_per_serving'] = float(instance.cost or 0)
        return data


class ProductionRecordSerializer(serializers.ModelSerializer):
    recipe_name = serializers.CharField(source='recipe.name', read_only=True)
    
    class Meta:
        model = ProductionRecord
        fields = ['id', 'recipe', 'recipe_name', 'quantity', 'timestamp', 'notes']

class ProductSerializer(serializers.ModelSerializer):
    recipe_name = serializers.CharField(source='recipe.name', read_only=True)
    cost = serializers.FloatField(read_only=True)
    profit = serializers.FloatField(read_only=True)
    profit_margin = serializers.FloatField(read_only=True)
    prepared_quantity = serializers.FloatField(read_only=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add prepared_quantity directly to the product
        data['prepared_quantity'] = instance.recipe.prepared_quantity if instance.recipe else 0
        print(f"Serializing {instance.name}:", data)  # Debug log
        return data
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'recipe', 'recipe_name', 'price', 
                 'is_active', 'cost', 'profit', 'profit_margin', 'prepared_quantity', 'created_at']


class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    timestamp = serializers.DateTimeField(read_only=True)
    total_price = serializers.FloatField(read_only=True)
    profit = serializers.FloatField(read_only=True)

    class Meta:
        model = Sale
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 
                 'total_price', 'profit', 'timestamp']
        read_only_fields = ['product_name', 'total_price', 'profit', 'timestamp']

    def create(self, validated_data):
        # Ensure product exists before creating sale
        product = validated_data.get('product')
        if not product:
            raise serializers.ValidationError({"product": "Product is required"})
        
        return super().create(validated_data)
