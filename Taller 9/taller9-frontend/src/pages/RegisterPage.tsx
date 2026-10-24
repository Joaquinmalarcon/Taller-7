import { useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonInputPasswordToggle,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRouterLink,
  useIonRouter,
  useIonToast
} from "@ionic/react";

import { registrarUsuario } from "../services/api";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useIonRouter();
  const [presentarToast] = useIonToast();

  const registrar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEnviando(true);
    try {
      await registrarUsuario(username, password);
      presentarToast({
        message: "Cuenta creada exitosamente. Inicia sesión.",
        color: "success",
        duration: 3000,
        position: "bottom"
      });
      router.push("/login", "root", "replace");
    } catch (error) {
      presentarToast({
        message: error instanceof Error ? error.message : String(error),
        color: "danger",
        duration: 3000,
        position: "bottom"
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Crear cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <form className="login" onSubmit={registrar}>
          <h1>Registro</h1>
          <p>Crea un nuevo usuario para el Taller 9.</p>

          <IonList>
            <IonItem>
              <IonInput
                label="Usuario"
                labelPlacement="stacked"
                value={username}
                autocomplete="username"
                placeholder="Ingresa tu usuario"
                onIonInput={(e) => setUsername(e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Contraseña"
                labelPlacement="stacked"
                type="password"
                value={password}
                autocomplete="new-password"
                placeholder="Mínimo 8 caracteres"
                onIonInput={(e) => setPassword(e.detail.value ?? "")}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonItem>
          </IonList>

          <IonButton type="submit" expand="block" disabled={enviando}>
            Registrarse
          </IonButton>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <IonRouterLink routerLink="/login">
              ¿Ya tienes una cuenta? Inicia sesión
            </IonRouterLink>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;