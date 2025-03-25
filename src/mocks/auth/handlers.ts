import * as env from "../../environments/environment";
import { http, HttpResponse } from "msw";

const apiUrl = env.environment.apiUrl;

export const authHandlers = [

    http.post(`${apiUrl}/auth/login`, () => {
      
      const user = {
        accessToken: "dummyAccessToken",
        refreshToken: "dummyRefreshToken",
        user: {
          id: "1",
          email: "dummy@example.com",
        },
      };
      

      return HttpResponse.json({
        status: 200,
        message: "",
        ...user,
      })
    }),

    http.post(`${apiUrl}/auth/logout`, () => {

        return HttpResponse.json({
          status: 200,
          message: ""
        });
    }),
];