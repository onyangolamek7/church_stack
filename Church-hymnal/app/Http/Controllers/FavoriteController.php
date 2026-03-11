<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorites;
use App\Models\Hymn;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->favorites()->with('hymn')->get());
    }

    public function store(Request $request, $hymnId)
    {
        $hymn = Hymn::findOrFail($hymnId);

        $already = $request->user()->favorites()
        ->where('hymn_id', $hymn->id)
        ->exists();
        if($already) {
            return response()->json(['message' => 'Already favorited'], 200);
        }

        $request->user()->favorites()->create(['hymn_id' => $hymn->id]);
        return response()->json(['message' => 'Added to favorites'],201);
    }

    public function destroy(Request $request, $hymnId)
    {
        $hymn = Hymn::findOrFail($hymnId);

        $request->user()->favorites()->where('hymn_id', $hymn->id)->delete();
        return response()->json(['message' => 'Removed from favorites']);
    }

    /*public function toggle($hymnId)
    {
        $user = auth()->user();

        $favorites = Favorites::where('user_id', $user->id)
        ->where('hymn_id', $hymnId)
        ->first();

        if ($favorites) {
            $favorites->delete();
            return response()->json(['message' => 'Removed']);
        }

        Favorites::create([
            'user_id' => $user->id,
            'hymn_id' => $hymnId,
        ]);

        return response()->json(['message' => 'Added']);

    }*/

}
