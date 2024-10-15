import { Routes } from '@angular/router';
import { authguardGuard } from './core/guards/authguard.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'initialize',
    pathMatch: 'full',
  },
  {
    path: 'initialize',
    loadComponent: () => import('./Pages/initialize/initialize.page').then( m => m.InitializePage)
  },

  {
    path: 'login',
    loadComponent: () => import('./Pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'sign',
    canActivate:[authguardGuard],
    loadComponent: () => import('./Pages/sign/sign.page').then( m => m.SignPage)
  },


  {
    path: 'face-registration',
    loadComponent: () => import('./Pages/face-registration/face-registration.page').then( m => m.FaceRegistrationPage),
  },

  {
    path: 'list-logs',
    loadComponent: () => import('./Pages/logs-list/logs-list.page').then( m => m.LogsListPage)
  },  {
    path: 'liveness-camera',
    loadComponent: () => import('./Pages/sign/liveness-camera/liveness-camera.page').then( m => m.LivenessCameraPage)
  }

  


];
