<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /** Staff roles an admin may assign (excludes nothing — admin included). */
    private function assignableRoles(): array
    {
        return Role::orderBy('name')->pluck('name')->all();
    }

    public function index(): Response
    {
        $users = User::with('roles:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'is_active', 'two_factor_confirmed_at'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'is_active' => $u->is_active,
                'two_factor' => ! is_null($u->two_factor_confirmed_at),
                'role' => $u->roles->first()?->name,
            ]);

        return Inertia::render('Users/Index', ['users' => $users]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create', ['roles' => $this->assignableRoles()]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:160|unique:users,email',
            'role' => ['required', Rule::in($this->assignableRoles())],
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // hashed by the cast
            'is_active' => true,
            'email_verified_at' => now(), // staff accounts are pre-verified by the admin
        ]);
        $user->assignRole($data['role']);

        return redirect()->route('users.index')->with('success', "Account created for {$user->name}.");
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'role' => $user->roles->first()?->name,
            ],
            'roles' => $this->assignableRoles(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'role' => ['required', Rule::in($this->assignableRoles())],
        ]);

        // Don't let the last admin demote themselves out of the admin role.
        if ($user->id === $request->user()->id && $user->hasRole('admin') && $data['role'] !== 'admin') {
            throw ValidationException::withMessages(['role' => 'You cannot remove your own administrator role.']);
        }

        $user->update(['name' => $data['name']]);
        $user->syncRoles([$data['role']]);

        return redirect()->route('users.index')->with('success', 'Account updated.');
    }

    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate(['password' => 'required|string|min:8']);
        $user->update(['password' => $data['password']]);

        return back()->with('success', "Temporary password set for {$user->name}.");
    }

    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            throw ValidationException::withMessages(['is_active' => 'You cannot deactivate your own account.']);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return back()->with('success', $user->is_active ? 'Account activated.' : 'Account deactivated.');
    }
}
