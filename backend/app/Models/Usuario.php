<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuario';

    protected $fillable = [
        'id_rol',
        'nombre',
        'apellido',
        'ci',
        'ci_extension',
        'ci_expedido',
        'fecha_nacimiento',
        'sexo',
        'direccion',
        'telefono',
        'correo',
        'password_hash',
        'estado',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'estado' => 'boolean',
        'fecha_nacimiento' => 'date',
    ];

    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol');
    }

    public function tienePermiso(string $permiso): bool
    {
        return $this->rol()
            ->whereHas('permisos', function ($query) use ($permiso) {
                $query->where('nombre', $permiso);
            })
            ->exists();
    }

    public function postulante()
    {
        return $this->hasOne(Postulante::class, 'id_usuario');
    }
}