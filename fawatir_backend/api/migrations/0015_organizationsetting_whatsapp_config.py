from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0014_alter_invoice_invoice_number_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='organizationsetting',
            name='whatsapp_config',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
