# Generated by Django 4.2.5 on 2025-04-27 13:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_comment_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemuser',
            name='image',
            field=models.BinaryField(blank=True, null=True),
        ),
    ]
