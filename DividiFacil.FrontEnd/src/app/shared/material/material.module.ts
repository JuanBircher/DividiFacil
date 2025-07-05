// 🚀 CREAR MÓDULO COMPARTIDO DE MATERIAL DESIGN

import { NgModule } from '@angular/core';

// Core Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

// Forms
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

// Navigation
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';

// Layout
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';

// Popups & Modals
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Data
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

// Indicators
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

const MATERIAL_MODULES = [
  // Core
  MatButtonModule,
  MatIconModule,
  MatCardModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  
  // Forms
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatCheckboxModule,
  MatRadioModule,
  
  // Navigation
  MatTabsModule,
  MatMenuModule,
  
  // Layout
  MatGridListModule,
  MatExpansionModule,
  
  // Popups & Modals
  MatDialogModule,
  MatSnackBarModule,
  MatTooltipModule,
  
  // Data
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  
  // Indicators
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatChipsModule
];

@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES
})
export class MaterialModule { }