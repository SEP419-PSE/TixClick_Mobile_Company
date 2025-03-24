export const login = async (userName: string, password: string) => {
  try {
    const response = await fetch('http://160.191.175.172:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName, password }), // dùng userName thay vì email
    });

    const data = await response.json();

    if (data.code === 200) {
      return {
        success: true,
        data: {
          accessToken: data.result.accessToken,
          refreshToken: data.result.refreshToken,
          role: data.result.roleName,
          status: data.result.status,
        },
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Login failed',
        code: data.code,
      };
    }
  } catch (error) {
    throw new Error('Network error');
  }
};
