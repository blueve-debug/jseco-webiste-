import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth, COLLECTIONS } from '@/lib/firebase-admin';
import { ALL_MODULE_IDS, DEFAULT_TEAM_MEMBERS, type TeamMember } from '@/lib/rbac';
import { requireAuth, isPrimarySuperAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth('settings');
    if (!auth.authorized) return auth.response;

    const snap = await adminDb.collection(COLLECTIONS.ADMIN).get();
    const members: TeamMember[] = [];

    snap.forEach((doc) => {
      const data = doc.data();
      const isPrimary = doc.id === 'kUwXnXdVTNYEunUTJjz6vC1aa8m2' || data.email === 'imran@jseco.in' || data.email === 'care@jseco.in' || data.email === 'blueve.tech@gmail.com';
      members.push({
        id: doc.id,
        name: data.name || (isPrimary ? 'Super Admin' : 'Staff Member'),
        email: data.email || (isPrimary ? 'imran@jseco.in' : 'care@jseco.in'),
        allowedModules: Array.isArray(data.allowedModules) && data.allowedModules.length > 0
          ? data.allowedModules
          : ALL_MODULE_IDS,
        status: data.status === 'suspended' ? 'suspended' : 'active',
        createdAt: data.createdAt || new Date().toISOString(),
        lastLogin: data.lastLogin || undefined,
        isPrimaryAdmin: isPrimary,
      });
    });

    // If primary admin is not in Firestore, seed it
    const hasPrimary = members.some((m) => m.isPrimaryAdmin || m.email === 'imran@jseco.in' || m.email === 'blueve.tech@gmail.com');
    if (!hasPrimary) {
      const primaryDoc = {
        uid: 'kUwXnXdVTNYEunUTJjz6vC1aa8m2',
        name: 'Super Admin',
        email: 'imran@jseco.in',
        allowedModules: ALL_MODULE_IDS,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await adminDb.collection(COLLECTIONS.ADMIN).doc('kUwXnXdVTNYEunUTJjz6vC1aa8m2').set(primaryDoc, { merge: true });
      members.unshift({
        id: 'kUwXnXdVTNYEunUTJjz6vC1aa8m2',
        name: 'Super Admin',
        email: 'imran@jseco.in',
        allowedModules: ALL_MODULE_IDS,
        status: 'active',
        createdAt: primaryDoc.createdAt,
        isPrimaryAdmin: true,
      });
    }

    // If only 1 member, seed default team members for quick experience
    if (members.length === 1) {
      for (const def of DEFAULT_TEAM_MEMBERS.slice(1)) {
        members.push(def);
      }
    }

    return NextResponse.json({ success: true, team: members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth('settings');
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { name, email, password, allowedModules } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid login email is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim().slice(0, 80);
    const modulesToGrant = Array.isArray(allowedModules) && allowedModules.length > 0
      ? allowedModules.filter((m) => ALL_MODULE_IDS.includes(m))
      : ['dashboard'];

    let uid: string;

    // 1. Create or get user in Firebase Auth
    try {
      const userRecord = await adminAuth.createUser({
        email: cleanEmail,
        password: password.trim(),
        displayName: cleanName,
      });
      uid = userRecord.uid;
    } catch (authError: unknown) {
      const err = authError as { code?: string; message?: string };
      if (err.code === 'auth/email-already-exists') {
        const existingUser = await adminAuth.getUserByEmail(cleanEmail);
        uid = existingUser.uid;
        // Update their password and display name
        await adminAuth.updateUser(uid, {
          password: password.trim(),
          displayName: cleanName,
        });
      } else {
        console.error('Firebase Auth user creation error:', authError);
        return NextResponse.json(
          { error: err.message || 'Failed to create user login credentials' },
          { status: 400 }
        );
      }
    }

    // 2. Save document in Firestore 'admin' collection
    const memberDoc = {
      uid,
      name: cleanName,
      email: cleanEmail,
      allowedModules: modulesToGrant,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection(COLLECTIONS.ADMIN).doc(uid).set(memberDoc, { merge: true });

    return NextResponse.json({
      success: true,
      member: {
        id: uid,
        ...memberDoc,
      },
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: 'Internal server error while adding team member' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth('settings');
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { id, name, allowedModules, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const isTargetSuper = id === 'kUwXnXdVTNYEunUTJjz6vC1aa8m2';
    const callerIsSuper = isPrimarySuperAdmin(auth.session);

    if (isTargetSuper && !callerIsSuper) {
      return NextResponse.json(
        { error: 'Only the primary super administrator can modify this account' },
        { status: 403 }
      );
    }

    if (id === auth.session.uid && status === 'suspended') {
      return NextResponse.json(
        { error: 'You cannot suspend your own account' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = String(name).trim().slice(0, 80);
    if (Array.isArray(allowedModules)) {
      updateData.allowedModules = allowedModules.filter((m) => ALL_MODULE_IDS.includes(m));
    }
    if (status && (status === 'active' || status === 'suspended')) {
      updateData.status = status;
    }

    await adminDb.collection(COLLECTIONS.ADMIN).doc(id).set(updateData, { merge: true });

    if (name) {
      try {
        await adminAuth.updateUser(id, { displayName: String(name).trim() });
      } catch {
        // If not in auth, non-fatal
      }
    }

    return NextResponse.json({ success: true, updated: updateData });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth('settings');
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    if (id === 'kUwXnXdVTNYEunUTJjz6vC1aa8m2') {
      return NextResponse.json({ error: 'Primary Super Administrator account cannot be deleted' }, { status: 403 });
    }

    if (id === auth.session.uid) {
      return NextResponse.json({ error: 'You cannot delete your own active administrator account' }, { status: 400 });
    }

    // Delete from Firestore
    await adminDb.collection(COLLECTIONS.ADMIN).doc(id).delete();

    // Delete from Firebase Auth if exists
    try {
      await adminAuth.deleteUser(id);
    } catch {
      // Non-fatal if user only existed in Firestore
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}
