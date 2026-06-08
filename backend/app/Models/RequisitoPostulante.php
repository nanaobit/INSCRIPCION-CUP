<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequisitoPostulante extends Model
{
    protected $table = 'requisito_postulante';

    protected $fillable = [
        'id_postulante',
        'id_usuario_validador',
        'titulo_bachiller',
        'documento_identidad',
        'otros_requisitos',
        'observacion',
        'estado',
        'fecha_validacion',
    ];

    protected $casts = [
        'titulo_bachiller' => 'boolean',
        'documento_identidad' => 'boolean',
        'fecha_validacion' => 'datetime',
    ];

    public function postulante()
    {
        return $this->belongsTo(Postulante::class, 'id_postulante');
    }

    public function validador()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario_validador');
    }
}