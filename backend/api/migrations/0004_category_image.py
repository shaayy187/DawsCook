# Generated by Django 4.2.5 on 2025-03-27 20:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='image',
            field=models.BinaryField(blank=True, null=True),
        ),
    ]
