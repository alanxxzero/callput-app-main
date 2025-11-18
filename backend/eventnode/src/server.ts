import express from "express"
import { postgraphile } from "postgraphile"
import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector"
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter"

export const runServer = () => {
  // graphql server running
  const app = express()

  app.use(
    postgraphile(
      `postgres://${process.env.AWS_RDS_DB_USER}:${process.env.AWS_RDS_DB_PASSWORD}@${process.env.AWS_RDS_DB_HOST}/${process.env.AWS_RDS_DB_NAME}`,
      "public",
      {
        appendPlugins: [
          PgSimplifyInflectorPlugin,
          ConnectionFilterPlugin,
        ],
        watchPg: true,
        graphiql: true,
        enhanceGraphiql: true,
      }
    )
  )

  app.listen(process.env.PORT || 3111)
}