import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Platform } from "react-native";

export function ExternalLink({
  href,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      target="_blank"
      {...props}
      href={href}
      onPress={(e) => {
        if (Platform.OS !== "web") {
          e.preventDefault();
          WebBrowser.openBrowserAsync(href as string);
        }
      }}
    />
  );
}
