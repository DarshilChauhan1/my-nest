import exp from "constants"
import ora from "ora"

export const additionDependenciesCliAnimation = ora({
    text: "Installing additional dependencies...",
    color: "green",
    spinner: "aesthetic",
});
export const postgreSqlTypeOrmAddAnimation  = ora({
    text: "Adding PostgreSQL And TypeORM dependencies...",
    color: "green",
    spinner: "aesthetic"
})

export const postgreSQLPrismaAddAnimation = ora({
    text: "Adding PostgreSQL And Prisma dependencies...",
    color: "yellow",
    spinner: "aesthetic"
})

export const addSwaggerAnimation = ora({
    text: "Adding Swagger dependencies...",
    color: "green",
    spinner: "aesthetic"
})

export const addGlobalCatchAnimation = ora({
    text: "Adding Global Catch Handler and Swagger Dependencies...",
    color: "green",
    spinner: "aesthetic"
})
