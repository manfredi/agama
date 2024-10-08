// Copyright (c) [2024] SUSE LLC
//
// All Rights Reserved.
//
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 2 of the License, or (at your option)
// any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, contact SUSE LLC.
//
// To contact SUSE LLC about this file by physical or electronic mail, you may
// find current contact information at www.suse.com.

//! D-Bus interface proxies for: `org.opensuse.Agama.Users1.*`
//!
//! This code was generated by `zbus-xmlgen` `3.1.0` from DBus introspection data.`.
use zbus::dbus_proxy;

/// First user as it comes from D-Bus.
///
/// It is composed of:
///
/// * full name
/// * user name
/// * password
/// * auto-login (enabled or not)
/// * some optional and additional data
pub type FirstUser = (
    String,
    String,
    String,
    bool,
    std::collections::HashMap<String, zbus::zvariant::OwnedValue>,
);

#[dbus_proxy(
    interface = "org.opensuse.Agama.Users1",
    default_service = "org.opensuse.Agama.Manager1",
    default_path = "/org/opensuse/Agama/Users1"
)]
trait Users1 {
    /// RemoveFirstUser method
    fn remove_first_user(&self) -> zbus::Result<u32>;

    /// RemoveRootPassword method
    fn remove_root_password(&self) -> zbus::Result<u32>;

    /// SetFirstUser method
    fn set_first_user(
        &self,
        full_name: &str,
        user_name: &str,
        password: &str,
        auto_login: bool,
        data: std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
    ) -> zbus::Result<(bool, Vec<String>)>;

    /// SetRootPassword method
    fn set_root_password(&self, value: &str, encrypted: bool) -> zbus::Result<u32>;

    /// SetRootSSHKey method
    #[dbus_proxy(name = "SetRootSSHKey")]
    fn set_root_sshkey(&self, value: &str) -> zbus::Result<u32>;

    /// Write method
    fn write(&self) -> zbus::Result<u32>;

    /// FirstUser property
    #[dbus_proxy(property)]
    fn first_user(&self) -> zbus::Result<FirstUser>;

    /// RootPasswordSet property
    #[dbus_proxy(property)]
    fn root_password_set(&self) -> zbus::Result<bool>;

    /// RootSSHKey property
    #[dbus_proxy(property, name = "RootSSHKey")]
    fn root_sshkey(&self) -> zbus::Result<String>;
}
