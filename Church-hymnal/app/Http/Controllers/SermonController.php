<?php

namespace App\Http\Controllers;

use App\Models\Sermon;
use Illuminate\Http\Request;

class SermonController extends Controller
{
    public function upcoming()
    {
        return response()->json([
            'data' => Sermon::upcoming()->orderBy('service_date', 'asc')->get()
        ]);
    }

    public function previous()
    {
        return response()->json([
            'data' => Sermon::previous()->orderBy('service_date', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'preacher' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'service_date' => 'required|date',
            'content' => 'nullable|string',
            'audio_url' => 'nullable|url|max:255',
            'video_url' => 'nullable|url|max:255',
            'status' => 'required|in:upcoming,completed',
        ]);

        $sermon = Sermon::create($validated);

        return response()->json([
            'message' => 'Sermon created successfully',
            'sermon' => $sermon
        ], 201);
    }

    public function show(Sermon $sermon)
    {
        return response()->json([
            'data' => $sermon
        ]);
    }
}
