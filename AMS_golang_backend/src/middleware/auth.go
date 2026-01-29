package middleware

import (
	"net/http"
	"time"

	"github.com/LINSITrack/backend/src/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var secretKey string

// Establecer la secret key en main
func SetSecretKey(key string) {
	secretKey = key
}

// Funcion para obtener la secret key en el login
func GetSecretKey() string {
	return secretKey
}

func AuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Obtener el token de la cookie
		tokenString, err := ctx.Cookie("jwt")
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "No se encontró la cookie de autenticación"})
			ctx.Abort()
			return
		}

		// Extraer los claims del token
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})

		// Validar token
		if err != nil || !token.Valid {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "token inválido"})
			ctx.Abort()
			return
		}

		// Verificar la expiracion del token
		if exp, ok := claims["exp"].(float64); ok {
			if time.Now().Unix() > int64(exp) {
				ctx.JSON(http.StatusUnauthorized, gin.H{"error": "token expirado"})
				ctx.Abort()
				return
			}
		}

		// Establecer claims en el contexto de Gin
		ctx.Set("userID", claims["id"])
		ctx.Set("userEmail", claims["email"])
		ctx.Set("userRole", claims["role"])

        // Claims opcionales
        if nombre, exists := claims["nombre"]; exists {
            ctx.Set("userName", nombre)
        }
        if apellido, exists := claims["apellido"]; exists {
            ctx.Set("userSurname", apellido)
        }
        if legajo, exists := claims["legajo"]; exists {
            ctx.Set("userLegajo", legajo)
        }

		ctx.Next()
	}
}

func RequireRole(allowedRoles ...models.Role) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userRole, exists := ctx.Get("userRole")
		if !exists {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "rol de usuario no encontrado"})
			ctx.Abort()
			return
		}

		role := models.Role(userRole.(string))
		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				ctx.Next()
				return
			}
		}

		ctx.JSON(http.StatusForbidden, gin.H{"error": "permisos insuficientes"})
		ctx.Abort()
	}
}
