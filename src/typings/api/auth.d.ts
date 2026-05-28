declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      avatar: string;
      nickname: string;
      phone: string;
      roles: string[];
      permissions: string[];
    }
  }
}
