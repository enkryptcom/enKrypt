const noop = () => 1;
global.__VERSION__ = "test";
require.extensions[".css"] = noop;
require.extensions[".scss"] = noop;
require.extensions[".png"] = noop;
require.extensions[".jpg"] = noop;
require.extensions[".jpeg"] = noop;
require.extensions[".gif"] = noop;
require.extensions[".svg"] = noop;
