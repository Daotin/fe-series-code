import {Middleware} from "koa";

/**
 * 把非机的http请求转为https
 */
export  default function sslify():Middleware {
    return (ctx, next) => {
        if(ctx.request.protocol!="https" && !["127.0.0.1","localhost"].includes(ctx.request.hostname.toLowerCase())){
            ctx.redirect("https://" + ctx.request.hostname) ;
            return ;
        }
        return next();
    }
}
