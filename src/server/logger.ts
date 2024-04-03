import winston  from "winston"

const logger = winston.createLogger({
    level: 'info', 
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(), 
    ),
    transports: [
        new winston.transports.Console(), 
    ]
})

export function myLogger(...objects: object[]): void {
  const toLog = objects.reduce((result, obj) => {
    return {...result, ...obj }
    }, {})
  logger.log("info", toLog)
}
