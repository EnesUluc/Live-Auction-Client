# 1- Build stage
FROM eclipse-temurin:25-jdk-jammy AS builder
WORKDIR /app

# Cache dependencies
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline

# Build application
COPY src src
RUN ./mvnw package -DskipTests

# 2 - Run stage
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
