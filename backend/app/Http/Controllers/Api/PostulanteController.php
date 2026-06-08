<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrera;
use App\Models\GestionAcademica;
use App\Models\PostulaCarrera;
use App\Models\Postulante;
use App\Models\RequisitoPostulante;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PostulanteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Postulante::with([
            'usuario',
            'gestionAcademica',
            'requisito',
            'carrerasPostuladas.carrera',
        ])->orderBy('id', 'desc');

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->where(function ($q) use ($buscar) {
                $q->where('nro_registro', 'ILIKE', "%{$buscar}%")
                    ->orWhere('colegio_procedencia', 'ILIKE', "%{$buscar}%")
                    ->orWhere('ciudad', 'ILIKE', "%{$buscar}%")
                    ->orWhereHas('usuario', function ($u) use ($buscar) {
                        $u->where('nombre', 'ILIKE', "%{$buscar}%")
                            ->orWhere('apellido', 'ILIKE', "%{$buscar}%")
                            ->orWhere('ci', 'ILIKE', "%{$buscar}%")
                            ->orWhere('correo', 'ILIKE', "%{$buscar}%");
                    });
            });
        }

        if ($request->filled('estado_requisitos')) {
            $query->where('estado_requisitos', $request->estado_requisitos);
        }

        if ($request->filled('estado_pago')) {
            $query->where('estado_pago', $request->estado_pago);
        }

        if ($request->filled('estado_academico')) {
            $query->where('estado_academico', $request->estado_academico);
        }

        if ($request->filled('estado_admision')) {
            $query->where('estado_admision', $request->estado_admision);
        }

        if ($request->filled('estado')) {
            $query->where('estado', filter_var($request->estado, FILTER_VALIDATE_BOOLEAN));
        }

        $postulantes = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $postulantes,
        ]);
    }

    public function registroPublico(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'ci' => ['required', 'string', 'max:20', 'unique:usuario,ci'],
            'ci_extension' => ['nullable', 'string', 'max:10'],
            'ci_expedido' => ['nullable', 'string', 'max:30'],
            'fecha_nacimiento' => ['required', 'date'],
            'sexo' => ['required', Rule::in(['MASCULINO', 'FEMENINO', 'OTRO'])],
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'correo' => ['required', 'email', 'max:150', 'unique:usuario,correo'],
            'password' => ['required', 'string', 'min:6'],

            'colegio_procedencia' => ['required', 'string', 'max:150'],
            'ciudad' => ['required', 'string', 'max:100'],

            'titulo_bachiller' => ['required', 'boolean'],
            'documento_identidad' => ['required', 'boolean'],
            'otros_requisitos' => ['nullable', 'string'],

            'id_carrera_primera_opcion' => ['required', 'exists:carrera,id'],
            'id_carrera_segunda_opcion' => [
                'nullable',
                'exists:carrera,id',
                'different:id_carrera_primera_opcion',
            ],
        ], $this->mensajesValidacion());

        $gestion = $this->obtenerGestionActiva();

        if (!$gestion) {
            return response()->json([
                'success' => false,
                'message' => 'No existe una gestión académica activa para registrar postulantes.',
            ], 422);
        }

        $rolPostulante = Rol::firstOrCreate(
            ['nombre' => 'POSTULANTE'],
            ['descripcion' => 'Usuario postulante del sistema']
        );

        $resultado = DB::transaction(function () use ($datos, $gestion, $rolPostulante) {
            $usuario = Usuario::create([
                'id_rol' => $rolPostulante->id,
                'nombre' => $datos['nombre'],
                'apellido' => $datos['apellido'],
                'ci' => $datos['ci'],
                'ci_extension' => $datos['ci_extension'] ?? null,
                'ci_expedido' => $datos['ci_expedido'] ?? null,
                'fecha_nacimiento' => $datos['fecha_nacimiento'],
                'sexo' => $datos['sexo'],
                'direccion' => $datos['direccion'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'],
                'password_hash' => Hash::make($datos['password']),
                'estado' => true,
            ]);

            $postulante = Postulante::create([
                'id_usuario' => $usuario->id,
                'id_gestion_academica' => $gestion->id,
                'nro_registro' => $this->generarNroRegistro(),
                'colegio_procedencia' => $datos['colegio_procedencia'],
                'ciudad' => $datos['ciudad'],
                'estado_requisitos' => 'PENDIENTE',
                'estado_pago' => 'PENDIENTE',
                'estado_academico' => 'SIN_EVALUAR',
                'estado_admision' => 'PENDIENTE',
                'promedio_final' => null,
                'fecha_registro' => now(),
                'estado' => true,
            ]);

            RequisitoPostulante::create([
                'id_postulante' => $postulante->id,
                'titulo_bachiller' => $datos['titulo_bachiller'],
                'documento_identidad' => $datos['documento_identidad'],
                'otros_requisitos' => $datos['otros_requisitos'] ?? null,
                'observacion' => null,
                'estado' => 'PENDIENTE',
                'fecha_validacion' => null,
            ]);

            PostulaCarrera::create([
                'id_postulante' => $postulante->id,
                'id_carrera' => $datos['id_carrera_primera_opcion'],
                'opcion_carrera' => 'PRIMERA_OPCION',
                'fecha_postulacion' => now(),
                'estado' => 'PENDIENTE',
            ]);

            if (!empty($datos['id_carrera_segunda_opcion'])) {
                PostulaCarrera::create([
                    'id_postulante' => $postulante->id,
                    'id_carrera' => $datos['id_carrera_segunda_opcion'],
                    'opcion_carrera' => 'SEGUNDA_OPCION',
                    'fecha_postulacion' => now(),
                    'estado' => 'PENDIENTE',
                ]);
            }

            return $postulante->load([
                'usuario.rol',
                'gestionAcademica',
                'requisito',
                'carrerasPostuladas.carrera',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Registro de postulante realizado correctamente.',
            'data' => $resultado,
        ], 201);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'id_gestion_academica' => ['nullable', 'exists:gestion_academica,id'],

            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'ci' => ['required', 'string', 'max:20', 'unique:usuario,ci'],
            'ci_extension' => ['nullable', 'string', 'max:10'],
            'ci_expedido' => ['nullable', 'string', 'max:30'],
            'fecha_nacimiento' => ['required', 'date'],
            'sexo' => ['required', Rule::in(['MASCULINO', 'FEMENINO', 'OTRO'])],
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'correo' => ['required', 'email', 'max:150', 'unique:usuario,correo'],
            'password' => ['required', 'string', 'min:6'],

            'colegio_procedencia' => ['required', 'string', 'max:150'],
            'ciudad' => ['required', 'string', 'max:100'],

            'titulo_bachiller' => ['required', 'boolean'],
            'documento_identidad' => ['required', 'boolean'],
            'otros_requisitos' => ['nullable', 'string'],

            'id_carrera_primera_opcion' => ['required', 'exists:carrera,id'],
            'id_carrera_segunda_opcion' => [
                'nullable',
                'exists:carrera,id',
                'different:id_carrera_primera_opcion',
            ],
        ], $this->mensajesValidacion());

        $gestion = !empty($datos['id_gestion_academica'])
            ? GestionAcademica::find($datos['id_gestion_academica'])
            : $this->obtenerGestionActiva();

        if (!$gestion) {
            return response()->json([
                'success' => false,
                'message' => 'No existe una gestión académica válida para registrar postulantes.',
            ], 422);
        }

        $rolPostulante = Rol::firstOrCreate(
            ['nombre' => 'POSTULANTE'],
            ['descripcion' => 'Usuario postulante del sistema']
        );

        $resultado = DB::transaction(function () use ($datos, $gestion, $rolPostulante) {
            $usuario = Usuario::create([
                'id_rol' => $rolPostulante->id,
                'nombre' => $datos['nombre'],
                'apellido' => $datos['apellido'],
                'ci' => $datos['ci'],
                'ci_extension' => $datos['ci_extension'] ?? null,
                'ci_expedido' => $datos['ci_expedido'] ?? null,
                'fecha_nacimiento' => $datos['fecha_nacimiento'],
                'sexo' => $datos['sexo'],
                'direccion' => $datos['direccion'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'],
                'password_hash' => Hash::make($datos['password']),
                'estado' => true,
            ]);

            $postulante = Postulante::create([
                'id_usuario' => $usuario->id,
                'id_gestion_academica' => $gestion->id,
                'nro_registro' => $this->generarNroRegistro(),
                'colegio_procedencia' => $datos['colegio_procedencia'],
                'ciudad' => $datos['ciudad'],
                'estado_requisitos' => 'PENDIENTE',
                'estado_pago' => 'PENDIENTE',
                'estado_academico' => 'SIN_EVALUAR',
                'estado_admision' => 'PENDIENTE',
                'promedio_final' => null,
                'fecha_registro' => now(),
                'estado' => true,
            ]);

            RequisitoPostulante::create([
                'id_postulante' => $postulante->id,
                'titulo_bachiller' => $datos['titulo_bachiller'],
                'documento_identidad' => $datos['documento_identidad'],
                'otros_requisitos' => $datos['otros_requisitos'] ?? null,
                'observacion' => null,
                'estado' => 'PENDIENTE',
            ]);

            PostulaCarrera::create([
                'id_postulante' => $postulante->id,
                'id_carrera' => $datos['id_carrera_primera_opcion'],
                'opcion_carrera' => 'PRIMERA_OPCION',
                'fecha_postulacion' => now(),
                'estado' => 'PENDIENTE',
            ]);

            if (!empty($datos['id_carrera_segunda_opcion'])) {
                PostulaCarrera::create([
                    'id_postulante' => $postulante->id,
                    'id_carrera' => $datos['id_carrera_segunda_opcion'],
                    'opcion_carrera' => 'SEGUNDA_OPCION',
                    'fecha_postulacion' => now(),
                    'estado' => 'PENDIENTE',
                ]);
            }

            return $postulante->load([
                'usuario.rol',
                'gestionAcademica',
                'requisito',
                'carrerasPostuladas.carrera',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Postulante registrado correctamente.',
            'data' => $resultado,
        ], 201);
    }

    public function show(Postulante $postulante): JsonResponse
    {
        $postulante->load([
            'usuario.rol',
            'gestionAcademica',
            'requisito.validador',
            'carrerasPostuladas.carrera',
        ]);

        return response()->json([
            'success' => true,
            'data' => $postulante,
        ]);
    }

    public function update(Request $request, Postulante $postulante): JsonResponse
    {
        $datos = $request->validate([
            'id_gestion_academica' => ['required', 'exists:gestion_academica,id'],

            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'ci' => [
                'required',
                'string',
                'max:20',
                Rule::unique('usuario', 'ci')->ignore($postulante->usuario->id),
            ],
            'ci_extension' => ['nullable', 'string', 'max:10'],
            'ci_expedido' => ['nullable', 'string', 'max:30'],
            'fecha_nacimiento' => ['required', 'date'],
            'sexo' => ['required', Rule::in(['MASCULINO', 'FEMENINO', 'OTRO'])],
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'correo' => [
                'required',
                'email',
                'max:150',
                Rule::unique('usuario', 'correo')->ignore($postulante->usuario->id),
            ],
            'password' => ['nullable', 'string', 'min:6'],

            'colegio_procedencia' => ['required', 'string', 'max:150'],
            'ciudad' => ['required', 'string', 'max:100'],

            'titulo_bachiller' => ['required', 'boolean'],
            'documento_identidad' => ['required', 'boolean'],
            'otros_requisitos' => ['nullable', 'string'],

            'id_carrera_primera_opcion' => ['required', 'exists:carrera,id'],
            'id_carrera_segunda_opcion' => [
                'nullable',
                'exists:carrera,id',
                'different:id_carrera_primera_opcion',
            ],

            'estado_requisitos' => ['required', Rule::in(['PENDIENTE', 'VALIDADO', 'RECHAZADO'])],
            'estado_pago' => ['required', Rule::in(['PENDIENTE', 'PAGADO', 'RECHAZADO'])],
            'estado_academico' => ['required', Rule::in(['SIN_EVALUAR', 'APROBADO', 'REPROBADO'])],
            'estado_admision' => [
                'required',
                Rule::in([
                    'PENDIENTE',
                    'ADMITIDO_PRIMERA_OPCION',
                    'ADMITIDO_SEGUNDA_OPCION',
                    'SIN_CUPO',
                    'RECHAZADO',
                ]),
            ],
            'promedio_final' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'estado' => ['required', 'boolean'],
        ], $this->mensajesValidacion());

        $resultado = DB::transaction(function () use ($datos, $postulante) {
            $usuario = $postulante->usuario;

            $usuarioDatos = [
                'nombre' => $datos['nombre'],
                'apellido' => $datos['apellido'],
                'ci' => $datos['ci'],
                'ci_extension' => $datos['ci_extension'] ?? null,
                'ci_expedido' => $datos['ci_expedido'] ?? null,
                'fecha_nacimiento' => $datos['fecha_nacimiento'],
                'sexo' => $datos['sexo'],
                'direccion' => $datos['direccion'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'],
                'estado' => $datos['estado'],
            ];

            if (!empty($datos['password'])) {
                $usuarioDatos['password_hash'] = Hash::make($datos['password']);
            }

            $usuario->update($usuarioDatos);

            $postulante->update([
                'id_gestion_academica' => $datos['id_gestion_academica'],
                'colegio_procedencia' => $datos['colegio_procedencia'],
                'ciudad' => $datos['ciudad'],
                'estado_requisitos' => $datos['estado_requisitos'],
                'estado_pago' => $datos['estado_pago'],
                'estado_academico' => $datos['estado_academico'],
                'estado_admision' => $datos['estado_admision'],
                'promedio_final' => $datos['promedio_final'] ?? null,
                'estado' => $datos['estado'],
            ]);

            RequisitoPostulante::updateOrCreate(
                ['id_postulante' => $postulante->id],
                [
                    'titulo_bachiller' => $datos['titulo_bachiller'],
                    'documento_identidad' => $datos['documento_identidad'],
                    'otros_requisitos' => $datos['otros_requisitos'] ?? null,
                ]
            );

            PostulaCarrera::where('id_postulante', $postulante->id)->delete();

            PostulaCarrera::create([
                'id_postulante' => $postulante->id,
                'id_carrera' => $datos['id_carrera_primera_opcion'],
                'opcion_carrera' => 'PRIMERA_OPCION',
                'fecha_postulacion' => now(),
                'estado' => 'PENDIENTE',
            ]);

            if (!empty($datos['id_carrera_segunda_opcion'])) {
                PostulaCarrera::create([
                    'id_postulante' => $postulante->id,
                    'id_carrera' => $datos['id_carrera_segunda_opcion'],
                    'opcion_carrera' => 'SEGUNDA_OPCION',
                    'fecha_postulacion' => now(),
                    'estado' => 'PENDIENTE',
                ]);
            }

            return $postulante->fresh()->load([
                'usuario.rol',
                'gestionAcademica',
                'requisito',
                'carrerasPostuladas.carrera',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Postulante actualizado correctamente.',
            'data' => $resultado,
        ]);
    }

    public function destroy(Postulante $postulante): JsonResponse
    {
        DB::transaction(function () use ($postulante) {
            $postulante->update([
                'estado' => false,
            ]);

            if ($postulante->usuario) {
                $postulante->usuario->update([
                    'estado' => false,
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Postulante desactivado correctamente.',
        ]);
    }

    public function validarRequisitos(Request $request, Postulante $postulante): JsonResponse
    {
        $datos = $request->validate([
            'estado' => ['required', Rule::in(['VALIDADO', 'RECHAZADO'])],
            'observacion' => ['nullable', 'string'],
        ]);

        $requisito = $postulante->requisito;

        if (!$requisito) {
            return response()->json([
                'success' => false,
                'message' => 'El postulante no tiene requisitos registrados.',
            ], 404);
        }

        DB::transaction(function () use ($datos, $postulante, $requisito, $request) {
            $requisito->update([
                'id_usuario_validador' => $request->user()->id,
                'estado' => $datos['estado'],
                'observacion' => $datos['observacion'] ?? null,
                'fecha_validacion' => now(),
            ]);

            $postulante->update([
                'estado_requisitos' => $datos['estado'],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Requisitos del postulante actualizados correctamente.',
            'data' => $postulante->fresh()->load('requisito.validador'),
        ]);
    }

    public function carrerasPublicas(): JsonResponse
    {
        $carreras = Carrera::where('estado', true)
            ->orderBy('nombre', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $carreras,
        ]);
    }

    private function obtenerGestionActiva(): ?GestionAcademica
    {
        return GestionAcademica::where('estado', true)
            ->orderBy('gestion', 'desc')
            ->orderBy('id', 'desc')
            ->first();
    }

    private function generarNroRegistro(): string
    {
        do {
            $codigo = 'CUP-' . date('Y') . '-' . strtoupper(Str::random(6));
        } while (Postulante::where('nro_registro', $codigo)->exists());

        return $codigo;
    }

    private function mensajesValidacion(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'ci.required' => 'El CI es obligatorio.',
            'ci.unique' => 'El CI ya está registrado.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'El correo no tiene un formato válido.',
            'correo.unique' => 'El correo ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'sexo.required' => 'El sexo es obligatorio.',
            'colegio_procedencia.required' => 'El colegio de procedencia es obligatorio.',
            'ciudad.required' => 'La ciudad es obligatoria.',
            'titulo_bachiller.required' => 'Debe indicar si presenta título de bachiller.',
            'documento_identidad.required' => 'Debe indicar si presenta documento de identidad.',
            'id_carrera_primera_opcion.required' => 'Debe seleccionar la primera opción de carrera.',
            'id_carrera_primera_opcion.exists' => 'La primera opción de carrera no existe.',
            'id_carrera_segunda_opcion.exists' => 'La segunda opción de carrera no existe.',
            'id_carrera_segunda_opcion.different' => 'La segunda opción debe ser diferente a la primera opción.',
        ];
    }
}