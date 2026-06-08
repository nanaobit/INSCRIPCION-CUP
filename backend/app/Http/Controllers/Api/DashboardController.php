<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrera;
use App\Models\CupoCarrera;
use App\Models\GestionAcademica;
use App\Models\Materia;
use App\Models\Postulante;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function resumenGeneral(Request $request): JsonResponse
    {
        $idGestion = $request->query('id_gestion_academica');

        $postulantesQuery = Postulante::query();

        if ($idGestion) {
            $postulantesQuery->where('id_gestion_academica', $idGestion);
        }

        $totalPostulantes = (clone $postulantesQuery)->count();
        $totalPostulantesActivos = (clone $postulantesQuery)->where('estado', true)->count();

        $totalUsuarios = Usuario::count();
        $totalUsuariosActivos = Usuario::where('estado', true)->count();

        $totalCarreras = Carrera::count();
        $totalCarrerasActivas = Carrera::where('estado', true)->count();

        $totalMaterias = Materia::count();
        $totalMateriasActivas = Materia::where('estado', true)->count();

        $totalGestiones = GestionAcademica::count();
        $totalGestionesActivas = GestionAcademica::where('estado', true)->count();

        $totalPendientesRequisitos = (clone $postulantesQuery)
            ->where('estado_requisitos', 'PENDIENTE')
            ->count();

        $totalRequisitosValidados = (clone $postulantesQuery)
            ->where('estado_requisitos', 'VALIDADO')
            ->count();

        $totalRequisitosRechazados = (clone $postulantesQuery)
            ->where('estado_requisitos', 'RECHAZADO')
            ->count();

        $totalPagoPendiente = (clone $postulantesQuery)
            ->where('estado_pago', 'PENDIENTE')
            ->count();

        $totalPagoPagado = (clone $postulantesQuery)
            ->where('estado_pago', 'PAGADO')
            ->count();

        $totalPagoRechazado = (clone $postulantesQuery)
            ->where('estado_pago', 'RECHAZADO')
            ->count();

        $ultimosPostulantes = Postulante::with([
                'usuario',
                'gestionAcademica',
                'carrerasPostuladas.carrera',
            ])
            ->when($idGestion, function ($query) use ($idGestion) {
                $query->where('id_gestion_academica', $idGestion);
            })
            ->orderBy('fecha_registro', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'totales' => [
                    'postulantes' => $totalPostulantes,
                    'postulantes_activos' => $totalPostulantesActivos,
                    'usuarios' => $totalUsuarios,
                    'usuarios_activos' => $totalUsuariosActivos,
                    'carreras' => $totalCarreras,
                    'carreras_activas' => $totalCarrerasActivas,
                    'materias' => $totalMaterias,
                    'materias_activas' => $totalMateriasActivas,
                    'gestiones_academicas' => $totalGestiones,
                    'gestiones_academicas_activas' => $totalGestionesActivas,
                ],
                'requisitos' => [
                    'pendientes' => $totalPendientesRequisitos,
                    'validados' => $totalRequisitosValidados,
                    'rechazados' => $totalRequisitosRechazados,
                ],
                'pagos' => [
                    'pendientes' => $totalPagoPendiente,
                    'pagados' => $totalPagoPagado,
                    'rechazados' => $totalPagoRechazado,
                ],
                'ultimos_postulantes' => $ultimosPostulantes,
            ],
        ]);
    }

    public function postulantesPorEstados(Request $request): JsonResponse
    {
        $idGestion = $request->query('id_gestion_academica');

        $baseQuery = Postulante::query();

        if ($idGestion) {
            $baseQuery->where('id_gestion_academica', $idGestion);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'estado_requisitos' => $this->contarPorCampo(clone $baseQuery, 'estado_requisitos'),
                'estado_pago' => $this->contarPorCampo(clone $baseQuery, 'estado_pago'),
                'estado_academico' => $this->contarPorCampo(clone $baseQuery, 'estado_academico'),
                'estado_admision' => $this->contarPorCampo(clone $baseQuery, 'estado_admision'),
            ],
        ]);
    }

    public function cuposPorCarrera(Request $request): JsonResponse
    {
        $idGestion = $request->query('id_gestion_academica');

        $query = CupoCarrera::with([
            'gestionAcademica',
            'carrera',
        ])->where('estado', true);

        if ($idGestion) {
            $query->where('id_gestion_academica', $idGestion);
        }

        $cupos = $query->orderBy('id_carrera', 'asc')->get();

        $data = $cupos->map(function ($cupo) {
            return [
                'id_cupo' => $cupo->id,
                'gestion' => $cupo->gestionAcademica ? [
                    'id' => $cupo->gestionAcademica->id,
                    'nombre' => $cupo->gestionAcademica->nombre,
                    'gestion' => $cupo->gestionAcademica->gestion,
                    'periodo' => $cupo->gestionAcademica->periodo,
                ] : null,
                'carrera' => $cupo->carrera ? [
                    'id' => $cupo->carrera->id,
                    'nombre' => $cupo->carrera->nombre,
                ] : null,
                'cantidad_cupos' => $cupo->cantidad_cupos,
                'cupos_disponibles' => $cupo->cupos_disponibles,
                'cupos_ocupados' => $cupo->cantidad_cupos - $cupo->cupos_disponibles,
                'porcentaje_ocupacion' => $cupo->cantidad_cupos > 0
                    ? round((($cupo->cantidad_cupos - $cupo->cupos_disponibles) / $cupo->cantidad_cupos) * 100, 2)
                    : 0,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function postulantesPorCarrera(Request $request): JsonResponse
    {
        $idGestion = $request->query('id_gestion_academica');

        $query = DB::table('postula_carrera')
            ->join('postulante', 'postula_carrera.id_postulante', '=', 'postulante.id')
            ->join('carrera', 'postula_carrera.id_carrera', '=', 'carrera.id')
            ->select(
                'carrera.id',
                'carrera.nombre',
                'postula_carrera.opcion_carrera',
                DB::raw('COUNT(postula_carrera.id) as total')
            )
            ->groupBy('carrera.id', 'carrera.nombre', 'postula_carrera.opcion_carrera')
            ->orderBy('carrera.nombre', 'asc');

        if ($idGestion) {
            $query->where('postulante.id_gestion_academica', $idGestion);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function actividadReciente(Request $request): JsonResponse
    {
        $idGestion = $request->query('id_gestion_academica');

        $ultimosPostulantes = Postulante::with([
                'usuario',
                'gestionAcademica',
                'carrerasPostuladas.carrera',
            ])
            ->when($idGestion, function ($query) use ($idGestion) {
                $query->where('id_gestion_academica', $idGestion);
            })
            ->orderBy('fecha_registro', 'desc')
            ->limit(10)
            ->get();

        $ultimosUsuarios = Usuario::with('rol')
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'ultimos_postulantes' => $ultimosPostulantes,
                'ultimos_usuarios' => $ultimosUsuarios,
            ],
        ]);
    }

    private function contarPorCampo($query, string $campo)
    {
        return $query
            ->select($campo, DB::raw('COUNT(*) as total'))
            ->groupBy($campo)
            ->orderBy($campo, 'asc')
            ->get();
    }
}