import { useAppStore } from "~/store";

class UserService {
  async ping() {
    try {
      const { useCustomFetch } = useAppVueUtils();
      const { myDid } = storeToRefs(useAppStore());
      await useCustomFetch(`/api/users/ping`, {
        method: "post",
        body: { did: myDid.value },
      });
    } catch (err) {
      console.log("error from ping", { err });
    }
  }

  async sendResetPasswordCodeEmail(email: string, code: string) {
    const { useCustomFetch } = useAppVueUtils();
    await useCustomFetch(`/api/users/reset-password-code`, {
      method: "post",
      body: { email, code },
    });
  }
}

export default UserService;
