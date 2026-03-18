<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InitiateStripeTitheRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'amount'   => ['required', 'numeric', 'min:0.50'],
            'currency' => ['nullable', 'string', 'size:3'],
        ];

        if (!$this->user()) {
            $rules['full_name'] = ['required', 'string', 'min:3', 'max:100'];
            $rules['email']     = ['required', 'email', 'max:191'];
            $rules['phone']     = ['nullable', 'string', 'max:20'];
        }

        return $rules;
    }
}
