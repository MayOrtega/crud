import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-editar-agregar-empleado',
  templateUrl: './editar-agregar-empleado.component.html',
  styleUrls: ['./editar-agregar-empleado.component.css']
})
export class EditarAgregarEmpleadoComponent {

  empForm: FormGroup;
  isNewEmployee: boolean = false;
  employeeId: number | undefined;
  employeeUpdated = new Subject();


  constructor(
     private fb:FormBuilder,
     private empleadosService: EmpleadosService,
     private dialogRef:MatDialogRef<EditarAgregarEmpleadoComponent>,
     @Inject(MAT_DIALOG_DATA) public data:any,
     private notificacionService : NotificacionService
    ){


    this.empForm = this.fb.group({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      username:new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      email: ['', [Validators.required, Validators.email]],
      phone:new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]),

    })
    if (data && data.id) {
      this.isNewEmployee = false;
      this.employeeId = data.id;
    } else {
      this.isNewEmployee = true;
    }
  }
  
  

  ngOnInit(): void {
    if (!this.isNewEmployee && this.data) {
      this.empForm.patchValue(this.data); 
    }
  }

  onFormSubmit(): void {
      if (this.empForm.valid) {
      const employeeData = {
        name: this.empForm.value.name,
        username: this.empForm.value.username,
        email: this.empForm.value.email,
        phone: this.empForm.value.phone,
      };
  
      if (this.isNewEmployee) {
        this.empleadosService.addEmployee(employeeData).subscribe(
          (newEmployee) => {
            this.dialogRef.close(newEmployee);
          },
          (error) => {
            throw new Error('Error creating employee: ' + error);
        }
        );
      } else if (this.employeeId) {
        this.empleadosService.updateEmployee(this.employeeId, employeeData).subscribe(
          () => {
            const employeeUpdatedData = { ...employeeData, id: this.employeeId };
            this.empleadosService.sendData(employeeUpdatedData);
            this.dialogRef.close(employeeData);
          },
          (error) => {
            throw new Error('Error updating employee: ' + error);
        }
        );
      }
   }
  }
}
