# Generated by Django 5.1.6 on 2025-04-25 13:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ingredient',
            name='cost_per_unit',
            field=models.DecimalField(decimal_places=5, default=0, max_digits=10),
        ),
    ]
