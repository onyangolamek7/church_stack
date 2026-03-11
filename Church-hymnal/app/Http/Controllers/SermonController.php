<?php

namespace App\Http\Controllers;

use App\Models\Sermon;
use Illuminate\Http\Request;

class SermonController extends Controller
{
    // All sermons (for /sermons page - both tabs)
    public function index()
    {
        Sermon::autoTransitionPastSermons();

        return response()->json([
            'upcoming' => Sermon::upcoming()->with('hymns')->orderBy('service_date', 'asc')->get(),
            'previous' => Sermon::previous()->with('hymns')->orderBy('service_date', 'desc')->get(),
        ]);
    }

    public function upcoming()
    {
        Sermon::autoTransitionPastSermons();

        return response()->json([
            'data' => Sermon::upcoming()->with('hymns')->orderBy('service_date', 'asc')->get()
        ]);
    }

    public function previous()
    {
        return response()->json([
            'data' => Sermon::previous()->with('hymns')->orderBy('service_date', 'desc')->get()
        ]);
    }

    // Next single upcoming sermon — used on homepage widget
    public function next()
    {
        Sermon::autoTransitionPastSermons();

        $sermon = Sermon::upcoming()
            ->with('hymns')
            ->orderBy('service_date', 'asc')
            ->first();

        return response()->json([
            'data' => $sermon
        ]);
    }

    // Single sermon detail
    public function show(Sermon $sermon)
    {
        return response()->json([
            'data' => $sermon->load('hymns')
        ]);
    }

    // Admin: create sermon (optionally attach hymns by ID array)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'preacher'     => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'service_date' => 'required|date',
            'content'      => 'nullable|string',
            'audio_url'    => 'nullable|url|max:255',
            'video_url'    => 'nullable|url|max:255',
            'status'       => 'required|in:upcoming,completed',
            'hymn_ids'     => 'nullable|array',
            'hymn_ids.*'   => 'exists:hymns,id',
        ]);

        $sermon = Sermon::create($validated);

        if (!empty($validated['hymn_ids'])) {
            $sync = collect($validated['hymn_ids'])
                ->mapWithKeys(fn($id, $i) => [$id => ['order' => $i + 1]])
                ->toArray();
            $sermon->hymns()->sync($sync);
        }

        return response()->json([
            'message' => 'Sermon created successfully',
            'data'    => $sermon->load('hymns')
        ], 201);
    }

    // Admin: update sermon
    public function update(Request $request, Sermon $sermon)
    {
        $validated = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'preacher'     => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'service_date' => 'sometimes|date',
            'content'      => 'nullable|string',
            'audio_url'    => 'nullable|url|max:255',
            'video_url'    => 'nullable|url|max:255',
            'status'       => 'sometimes|in:upcoming,completed',
            'hymn_ids'     => 'nullable|array',
            'hymn_ids.*'   => 'exists:hymns,id',
        ]);

        $sermon->update($validated);

        if (isset($validated['hymn_ids'])) {
            $sync = collect($validated['hymn_ids'])
                ->mapWithKeys(fn($id, $i) => [$id => ['order' => $i + 1]])
                ->toArray();
            $sermon->hymns()->sync($sync);
        }

        return response()->json([
            'data' => $sermon->load('hymns')
        ]);
    }

    // Admin: delete sermon
    public function destroy(Sermon $sermon)
    {
        $sermon->delete();
        return response()->json(['message' => 'Sermon deleted successfully']);
    }
}
