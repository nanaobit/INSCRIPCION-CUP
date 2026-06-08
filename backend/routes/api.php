<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\PermisoController;
use App\Http\Controllers\Api\PostulanteController;
use App\Http\Controllers\Api\RequisitoPostulanteController;
use App\Http\Controllers\Api\GestionAcademicaController;
use App\Http\Controllers\Api\CarreraController;
use App\Http\Controllers\Api\CupoCarreraController;
use App\Http\Controllers\Api\MateriaController;
use App\Http\Controllers\Api\EvaluacionController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| Rutas públicas
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/public/carreras', [PostulanteController::class, 'carrerasPublicas']);
Route::post('/postulantes/registro', [PostulanteController::class, 'registroPublico']);

/*
|--------------------------------------------------------------------------
| Rutas protegidas con Sanctum
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {


    Route::prefix('auth')->group(function () {
        Route::get('/perfil', [AuthController::class, 'perfil']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    });

    

    // Usuarios
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);
    Route::get('/usuarios/{usuario}', [UsuarioController::class, 'show']);
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update']);
    Route::patch('/usuarios/{usuario}', [UsuarioController::class, 'update']);
    Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy']);
    Route::patch('/usuarios/{usuario}/activar', [UsuarioController::class, 'activar']);

    // Roles
    Route::get('/roles', [RolController::class, 'index']);
    Route::post('/roles', [RolController::class, 'store']);
    Route::get('/roles/{rol}', [RolController::class, 'show']);
    Route::put('/roles/{rol}', [RolController::class, 'update']);
    Route::patch('/roles/{rol}', [RolController::class, 'update']);
    Route::delete('/roles/{rol}', [RolController::class, 'destroy']);
    Route::get('/roles/{rol}/permisos', [RolController::class, 'permisos']);
    Route::put('/roles/{rol}/permisos', [RolController::class, 'asignarPermisos']);

    // Permisos
    Route::get('/permisos', [PermisoController::class, 'index']);
    Route::post('/permisos', [PermisoController::class, 'store']);
    Route::get('/permisos/{permiso}', [PermisoController::class, 'show']);
    Route::put('/permisos/{permiso}', [PermisoController::class, 'update']);
    Route::patch('/permisos/{permiso}', [PermisoController::class, 'update']);
    Route::delete('/permisos/{permiso}', [PermisoController::class, 'destroy']);

    // Carreras

    Route::get('/postulantes', [PostulanteController::class, 'index']);
    Route::post('/postulantes', [PostulanteController::class, 'store']);
    Route::get('/postulantes/{postulante}', [PostulanteController::class, 'show']);
    Route::put('/postulantes/{postulante}', [PostulanteController::class, 'update']);
    Route::patch('/postulantes/{postulante}', [PostulanteController::class, 'update']);
    Route::delete('/postulantes/{postulante}', [PostulanteController::class, 'destroy']);

    

    Route::get('/requisitos-postulantes', [RequisitoPostulanteController::class, 'index']);
    Route::get('/requisitos-postulantes/pendientes', [RequisitoPostulanteController::class, 'pendientes']);
    Route::get('/requisitos-postulantes/{requisito}', [RequisitoPostulanteController::class, 'show']);
    Route::put('/requisitos-postulantes/{requisito}', [RequisitoPostulanteController::class, 'actualizarPresentados']);
    Route::patch('/requisitos-postulantes/{requisito}/validar', [RequisitoPostulanteController::class, 'validar']);
    Route::patch('/requisitos-postulantes/{requisito}/rechazar', [RequisitoPostulanteController::class, 'rechazar']);

    Route::get('/postulantes/{postulante}/requisitos', [RequisitoPostulanteController::class, 'requisitosPorPostulante']);

    // CU5 - Gestiones académicas
    Route::get('/gestiones-academicas', [GestionAcademicaController::class, 'index']);
    Route::post('/gestiones-academicas', [GestionAcademicaController::class, 'store']);
    Route::get('/gestiones-academicas/{gestion}', [GestionAcademicaController::class, 'show']);
    Route::put('/gestiones-academicas/{gestion}', [GestionAcademicaController::class, 'update']);
    Route::patch('/gestiones-academicas/{gestion}', [GestionAcademicaController::class, 'update']);
    Route::delete('/gestiones-academicas/{gestion}', [GestionAcademicaController::class, 'destroy']);
    Route::patch('/gestiones-academicas/{gestion}/activar', [GestionAcademicaController::class, 'activar']);

    // CU5 - Carreras
    Route::get('/carreras', [CarreraController::class, 'index']);
    Route::post('/carreras', [CarreraController::class, 'store']);
    Route::get('/carreras/{carrera}', [CarreraController::class, 'show']);
    Route::put('/carreras/{carrera}', [CarreraController::class, 'update']);
    Route::patch('/carreras/{carrera}', [CarreraController::class, 'update']);
    Route::delete('/carreras/{carrera}', [CarreraController::class, 'destroy']);
    Route::patch('/carreras/{carrera}/activar', [CarreraController::class, 'activar']);

    // CU5 - Cupos por carrera
    Route::get('/cupos-carrera', [CupoCarreraController::class, 'index']);
    Route::post('/cupos-carrera', [CupoCarreraController::class, 'store']);
    Route::get('/cupos-carrera/{cupo}', [CupoCarreraController::class, 'show']);
    Route::put('/cupos-carrera/{cupo}', [CupoCarreraController::class, 'update']);
    Route::patch('/cupos-carrera/{cupo}', [CupoCarreraController::class, 'update']);
    Route::delete('/cupos-carrera/{cupo}', [CupoCarreraController::class, 'destroy']);
    Route::patch('/cupos-carrera/{cupo}/activar', [CupoCarreraController::class, 'activar']);

    Route::get('/gestiones-academicas/{idGestion}/cupos', [CupoCarreraController::class, 'porGestion']);
    Route::get('/carreras/{idCarrera}/cupos', [CupoCarreraController::class, 'porCarrera']);

    /*
    |--------------------------------------------------------------------------
    | CU6 - Materias y evaluaciones
    |--------------------------------------------------------------------------
    */

    // Materias
    Route::get('/materias', [MateriaController::class, 'index']);
    Route::post('/materias', [MateriaController::class, 'store']);
    Route::get('/materias/{materia}', [MateriaController::class, 'show']);
    Route::put('/materias/{materia}', [MateriaController::class, 'update']);
    Route::patch('/materias/{materia}', [MateriaController::class, 'update']);
    Route::delete('/materias/{materia}', [MateriaController::class, 'destroy']);
    Route::patch('/materias/{materia}/activar', [MateriaController::class, 'activar']);
    Route::get('/materias/{materia}/evaluaciones', [MateriaController::class, 'evaluaciones']);

    // Evaluaciones
    Route::get('/evaluaciones', [EvaluacionController::class, 'index']);
    Route::post('/evaluaciones', [EvaluacionController::class, 'store']);
    Route::get('/evaluaciones/{evaluacion}', [EvaluacionController::class, 'show']);
    Route::put('/evaluaciones/{evaluacion}', [EvaluacionController::class, 'update']);
    Route::patch('/evaluaciones/{evaluacion}', [EvaluacionController::class, 'update']);
    Route::delete('/evaluaciones/{evaluacion}', [EvaluacionController::class, 'destroy']);
    Route::patch('/evaluaciones/{evaluacion}/activar', [EvaluacionController::class, 'activar']);
    Route::get('/materias/{materia}/evaluaciones-detalle', [EvaluacionController::class, 'porMateria']);

    /*
    |--------------------------------------------------------------------------
    | CU7 - Dashboard administrativo y estadísticas
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard/resumen', [DashboardController::class, 'resumenGeneral']);
    Route::get('/dashboard/postulantes-estados', [DashboardController::class, 'postulantesPorEstados']);
    Route::get('/dashboard/cupos-carrera', [DashboardController::class, 'cuposPorCarrera']);
    Route::get('/dashboard/postulantes-carrera', [DashboardController::class, 'postulantesPorCarrera']);
    Route::get('/dashboard/actividad-reciente', [DashboardController::class, 'actividadReciente']);
});