import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

// Services y Models
import { AuthService } from '../../../core/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario, UsuarioActualizacionDto } from '../../../core/models/usuario.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-editar',
  standalone: true,
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    CardComponent,
    LoadingSpinnerComponent
  ]
})
export class EditarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados
  loading = false;
  guardando = false;
  subiendoImagen = false;
  
  // Datos
  usuario: Usuario | null = null;
  idUsuario = '';
  
  // Formularios
  perfilForm: FormGroup;
  
  // Imagen
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      telefono: [''],
      urlImagen: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR DATOS DEL USUARIO
   */
  cargarDatosUsuario(): void {
    this.loading = true;
    
    const usuarioToken = this.authService.obtenerUsuario();
    if (!usuarioToken?.idUsuario) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.idUsuario = usuarioToken.idUsuario;

    this.usuarioService.obtenerUsuario(this.idUsuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {  // 🔧 CAMBIAR: response es ResponseDto<UsuarioDto>
          this.loading = false;
          if (response.exito && response.data) {
            this.usuario = response.data;
            this.cargarDatosEnFormulario();
          } else {
            this.snackBar.open(response.mensaje || 'Error al cargar perfil', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al cargar usuario:', err);
          this.snackBar.open('Error al cargar perfil', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 📝 CARGAR DATOS EN FORMULARIO
   */
  private cargarDatosEnFormulario(): void {
    if (!this.usuario) return;

    this.perfilForm.patchValue({
      nombre: this.usuario.nombre,
      telefono: this.usuario.telefono || '',
      urlImagen: this.usuario.urlImagen || ''
    });

    if (this.usuario.urlImagen) {
      this.imagenPreview = this.usuario.urlImagen;
    }
  }

  /**
   * 🖼️ SELECCIONAR IMAGEN
   */
  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const archivo = input.files[0];
      
      // Validar tipo y tamaño
      if (!archivo.type.startsWith('image/')) {
        this.snackBar.open('Por favor selecciona un archivo de imagen', 'Cerrar', { duration: 3000 });
        return;
      }

      if (archivo.size > 5 * 1024 * 1024) { // 5MB
        this.snackBar.open('La imagen debe ser menor a 5MB', 'Cerrar', { duration: 3000 });
        return;
      }

      this.imagenSeleccionada = archivo;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreview = e.target?.result as string;
      };
      reader.readAsDataURL(archivo);
    }
  }

  /**
   * 📤 SUBIR IMAGEN
   */
  async subirImagen(): Promise<string | null> {
    if (!this.imagenSeleccionada || !this.idUsuario) return null;

    this.subiendoImagen = true;

    try {
      const response = await this.usuarioService.subirImagen(this.idUsuario, this.imagenSeleccionada).toPromise();
      this.subiendoImagen = false;
      
      // 🔧 CAMBIAR: response es ResponseDto<{ urlImagen: string }>
      if (response?.exito && response.data) {
        return response.data.urlImagen;
      }
      return null;
    } catch (error) {
      this.subiendoImagen = false;
      console.error('Error al subir imagen:', error);
      this.snackBar.open('Error al subir imagen', 'Cerrar', { duration: 3000 });
      return null;
    }
  }

  /**
   * 💾 GUARDAR CAMBIOS
   */
  async guardarCambios(): Promise<void> {
    if (!this.perfilForm.valid || !this.idUsuario) return;

    this.guardando = true;

    try {
      // Subir imagen si se seleccionó una nueva
      let urlImagen = this.perfilForm.get('urlImagen')?.value;
      if (this.imagenSeleccionada) {
        const nuevaUrlImagen = await this.subirImagen();
        if (nuevaUrlImagen) {
          urlImagen = nuevaUrlImagen;
        }
      }

      // Preparar datos de actualización
      const datosActualizacion: UsuarioActualizacionDto = {
        nombre: this.perfilForm.get('nombre')?.value,
        telefono: this.perfilForm.get('telefono')?.value || undefined,
        urlImagen: urlImagen || undefined
      };

      // Actualizar usuario
      const response = await this.usuarioService.actualizarUsuario(this.idUsuario, datosActualizacion).toPromise();

      this.guardando = false;

      // 🔧 CAMBIAR: response es ResponseDto<void>
      if (response?.exito) {
        this.snackBar.open('¡Perfil actualizado exitosamente!', 'Cerrar', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        this.router.navigate(['/perfil']);
      } else {
        this.snackBar.open(response?.mensaje || 'Error al actualizar perfil', 'Cerrar', { duration: 3000 });
      }

    } catch (error) {
      this.guardando = false;
      console.error('Error al guardar cambios:', error);
      this.snackBar.open('Error al actualizar perfil', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * 🗑️ ELIMINAR IMAGEN
   */
  eliminarImagen(): void {
    this.imagenSeleccionada = null;
    this.imagenPreview = null;
    this.perfilForm.patchValue({ urlImagen: '' });
  }

  /**
   * 🔙 CANCELAR Y VOLVER
   */
  cancelar(): void {
    this.router.navigate(['/perfil']);
  }

  /**
   * 🎨 OBTENER INICIALES
   */
  obtenerIniciales(): string {
    const nombre = this.perfilForm.get('nombre')?.value || this.usuario?.nombre || 'U';
    const palabras = nombre.split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return palabras[0][0].toUpperCase();
  }
}
