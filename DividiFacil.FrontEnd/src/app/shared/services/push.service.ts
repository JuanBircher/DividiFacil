import { Injectable, NgZone } from '@angular/core';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PushService {
  private messaging: Messaging | null = null;
  private currentToken = new BehaviorSubject<string | null>(null);
  public token$ = this.currentToken.asObservable();
  public message$ = new BehaviorSubject<any>(null);

  constructor(private ngZone: NgZone) {
    // Inicializa messaging solo cuando la app ya está lista
    try {
      this.messaging = getMessaging();
      this.listenMessages();
    } catch (e) {
      this.messaging = null;
    }
  }

  async obtenerToken(): Promise<string | null> {
    if (!this.messaging) return null;
    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey
      });
      this.currentToken.next(token);
      return token;
    } catch (error) {
      this.currentToken.next(null);
      return null;
    }
  }

  private listenMessages() {
    if (!this.messaging) return;
    onMessage(this.messaging, (payload) => {
      this.ngZone.run(() => {
        this.message$.next(payload);
      });
    });
  }
}
