export const login = async (userName: string, password: string) => {
  try {
    const response = await fetch('https://tixclick.site/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName, password }),
    });

    const data = await response.json();

    if (data.code === 200) {
      const { accessToken, refreshToken, roleName, status } = data.result;

      if (roleName === 'ORGANIZER') {
        return {
          success: true,
          data: {
            accessToken,
            refreshToken,
            role: roleName,
            status,
          },
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: 'Bạn không có quyền truy cập. Chỉ tài khoản ORGANIZER được phép đăng nhập.',
          code: 403,
        };
      }
    } else {
      return {
        success: false,
        message: data.message || 'Login failed',
        code: data.code,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Đã xảy ra lỗi khi kết nối đến máy chủ.',
      code: 500,
    };
  }
};
