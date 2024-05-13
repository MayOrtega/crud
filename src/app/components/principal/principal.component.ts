import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog} from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';


import { EmpleadosService } from 'src/app/services/empleados.service';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { EditarAgregarEmpleadoComponent } from '../editar-agregar-empleado/editar-agregar-empleado.component';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  displayedColumns: string[] = [
    'id',
    'name',
    'username',
    'email',
    'phone',
    'action'
  ];
  dataSource!: MatTableDataSource<any>;
  employeesInfo:any[]=[];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private empleadosService: EmpleadosService,
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getEmployeeList();
    this.empleadosService.data$.subscribe({
      next: (data) => {
        if (!data) return;
        
        this.employeesInfo = this.employeesInfo.map( employee => {
          if (employee.id === data.id) return data;
          return employee;
        });

        this.dataSource = new MatTableDataSource(this.employeesInfo);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    })
    
  }

  openAddEditEmpForm() {
    const dialogRef = this.dialog.open(EditarAgregarEmpleadoComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.addEmployee(val);
        }
      }
    });
  }


  addEmployee(data: any): void { 
    if (data) { 
      console.log("Datos del empleado a agregar:", data);
      this.empleadosService.addEmployee(data).subscribe({
        next: (newEmployee) => {
          console.log("Respuesta del servidor:", newEmployee);
          this.notificacionService.openSnackBar('Employee added!', 'Done');
          this.dataSource.data = [...this.dataSource.data, newEmployee];
          this.cdr.detectChanges();
          this.notificacionService.openSnackBar('Employee added!', 'Listo');
        },
        error: (err) => {
          console.error("Error al agregar empleado:", err);
        }
      });
    }
  }

  getEmployeeList() {
    this.empleadosService.getEmployeeList().subscribe({
      next: (data: any[]) => {
        const dataSourceData = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          username: item.username,
          email: item.email,
          phone: item.phone
        }));

        this.employeesInfo = dataSourceData;
        this.dataSource = new MatTableDataSource(dataSourceData);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: console.error
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteEmployee(id: number) {
    console.log('ID del empleado a eliminar:', id);
    this.empleadosService.deleteEmployee(id).subscribe({
      next: (res) => {
        this.notificacionService.openSnackBar('Employee deleted!', 'Done');
        const updatedData = this.dataSource.data.filter(emp => emp.id !== id);
        this.dataSource.data = updatedData;
      },
      error: console.log
    });
  }

  openEditForm(data: any) {
    console.log('Abriendo diálogo de edición con datos:', data);
    const dialogRef = this.dialog.open(EditarAgregarEmpleadoComponent, {
      data,
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        this.notificacionService.openSnackBar('Employee updated!', 'Done');
        console.log('Diálogo de edición cerrado, datos actualizados:', val);
        if (val) {
          console.log('Datos actuales en la lista de empleados:', this.dataSource.data);
                
          const index = this.dataSource.data.findIndex(emp => emp.id === val.id);
          if (index !== -1) {
            this.dataSource.data[index] = val;
            this.dataSource.data = [...this.dataSource.data]; 
            console.log('Datos actualizados en la lista de empleados:', this.dataSource.data);
            this.dataSource.data[0].phone = 343434434;
            
            this.dataSource._updateChangeSubscription();
            this.dataSource.sort = this.sort; 
            this.dataSource.paginator = this.paginator; 

            
          }
        }
      }
    });
  }
}