<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hymn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HymnController extends Controller
{
    public function index(Request $request): JsonResponse
    {
       $perPage = min((int) $request->query('per_page', 20), 999);
        $hymns   = Hymn::orderBy('number')->paginate($perPage);

        if ($request->user()) {
            $favoriteIds = $request->user()
                ->favorites()           // assumes User hasMany Favorite
                ->pluck('hymn_id')
                ->flip()
                ->all();

            $hymns->getCollection()->transform(function ($hymn) use ($favoriteIds) {
                $hymn->isFavorite = isset($favoriteIds[$hymn->id]);
                return $hymn;
            });
        } else {
            $hymns->getCollection()->transform(function ($hymn) {
                $hymn->isFavorite = false;
                return $hymn;
            });
        }

        return response()->json($hymns);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $hymn = Hymn::findOrFail($id);

        $hymn->isFavorite = $request->user()
            ? $request->user()->favorites()->where('hymn_id', $hymn->id)->exists()
            : false;

        return response()->json($hymn);
    }

    public function search(Request $request): JsonResponse
    {
        $q = trim($request->query('q', ''));

        if (!$q) {
            return response()->json([]);
        }

        $hymns = Hymn::where('title', 'like', "%{$q}%")
            ->orWhere('number', 'like', "%{$q}%")
            ->orderBy('number')
            ->limit(50)
            ->get();

        return response()->json($hymns);
    }

    public function random(): JsonResponse
    {
        $hymn = Hymn::inRandomOrder()->first();
        return response()->json($hymn);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'number' => 'required|integer|min:1|unique:hymns,number',
            'title'  => 'required|string|max:255',
            'lyrics' => 'required|string',
        ]);

        $hymn = Hymn::create([
            ...$data,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Hymn created successfully.',
            'hymn'    => $hymn,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $hymn = Hymn::findOrFail($id);

        $data = $request->validate([
            'number' => "sometimes|required|integer|min:1|unique:hymns,number,{$hymn->id}",
            'title'  => 'sometimes|required|string|max:255',
            'lyrics' => 'sometimes|required|string',
        ]);

        $hymn->update([
            ...$data,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Hymn updated successfully.',
            'hymn'    => $hymn->fresh(),
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $hymn = Hymn::findOrFail($id);
        $hymn->delete();

        return response()->json(['message' => 'Hymn deleted successfully.']);
    }
}
