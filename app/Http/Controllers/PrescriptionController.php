<?php

namespace App\Http\Controllers;

use App\Models\Prescription;

class PrescriptionController extends Controller
{
    public function print(Prescription $prescription)
    {
        $prescription->load(['patient', 'items', 'author']);

        return view('prescription', ['p' => $prescription]);
    }
}
