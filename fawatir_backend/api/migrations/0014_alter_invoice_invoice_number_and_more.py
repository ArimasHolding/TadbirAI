from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_employee_metadata_payroll_metadata'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invoice',
            name='invoice_number',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='quotation',
            name='quotation_number',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterUniqueTogether(
            name='invoice',
            unique_together={('organisation', 'invoice_number')},
        ),
        migrations.AlterUniqueTogether(
            name='quotation',
            unique_together={('organisation', 'quotation_number')},
        ),
    ]
