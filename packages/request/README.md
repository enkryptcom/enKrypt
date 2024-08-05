# @enkryptcom/request

## Network requests class for enkrypt extension

### Config

To be able to properly use the RPCh single environment variable is required:
`RPCH_SECRET_TOKEN` - secret token retireved from [hopr degen](https://degen.rpch.net/)

Additionally, if needed the `DISCOVERY_PLATFORM_API_ENDPOINT` can be set to overwrite the default setting for RPCh discovery platform API endpoint

Both are configurable with use of `build` command from package.json.

To set the `RPCH_SECRET_TOKEN` simply add `--env.RPCH_SECRET_TOKEN secret` replacing phrase `secret` with the actual value.
Final command run in the CLI should have form:

`yarn build --env.RPCH_SECRET_TOKEN secret`

To set the `DISCOVERY_PLATFORM_API_ENDPOINT` add following value/option at the end of the command:
`--env.DISCOVERY_PLATFORM_API_ENDPOINT url` where `url` should be replaced with actual URL, resulting in final command:

`yarn build --env.RPCH_SECRET_TOKEN secret --env.DISCOVERY_PLATFORM_API_ENDPOINT url`
