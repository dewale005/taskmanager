import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Route Components
import { LoginFormComponent } from './page/login-form/login-form.component';
import { RegisterFormComponent } from './page/register-form/register-form.component';
import { NavigationComponent } from './page/navigation/navigation.component';

// Route Guards
import { authGuard, authGuardWithRedirect } from './core/auth.guard';

/**
 * Named route paths for consistent reuse across the app.
 */
export const AppRoutes = {
  Login: 'login',
  Register: 'register',
  Home: '', // NavigationComponent acts as a shell/dashboard
  Wildcard: '**',
};

/**
 * Main application routes.
 * Consider separating these into feature modules as the app scales.
 */
const routes: Routes = [
  {
    path: AppRoutes.Login,
    title: 'Login',
    canActivate: [authGuardWithRedirect],
    component: LoginFormComponent,
  },
  {
    path: AppRoutes.Register,
    component: RegisterFormComponent,
    canActivate: [authGuardWithRedirect],
    title: 'Register',
  },
  {
    path: AppRoutes.Home,
    component: NavigationComponent,
    canActivate: [authGuard],
    title: 'Home',
  },
  {
    path: AppRoutes.Wildcard,
    redirectTo: AppRoutes.Login,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
