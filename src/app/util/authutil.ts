import { Auth } from "@angular/fire/auth";

export function logOut(auth: Auth): Promise<void> {
    return auth.signOut();
}
