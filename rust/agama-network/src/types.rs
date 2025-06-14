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

use cidr::errors::NetworkParseError;
use serde::{Deserialize, Serialize};
use std::{
    fmt,
    str::{self, FromStr},
};
use thiserror::Error;
use zbus;

use super::settings::NetworkConnection;

/// Network device
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub struct Device {
    pub name: String,
    pub type_: DeviceType,
    pub state: DeviceState,
}

#[derive(Debug, Default, PartialEq, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct SSID(pub Vec<u8>);

impl SSID {
    pub fn to_vec(&self) -> &Vec<u8> {
        &self.0
    }
}

impl fmt::Display for SSID {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", str::from_utf8(&self.0).unwrap())
    }
}

impl FromStr for SSID {
    type Err = NetworkParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(SSID(s.as_bytes().into()))
    }
}

impl From<SSID> for Vec<u8> {
    fn from(value: SSID) -> Self {
        value.0
    }
}

#[derive(Default, Debug, PartialEq, Copy, Clone, Serialize, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub enum DeviceType {
    Loopback = 0,
    #[default]
    Ethernet = 1,
    Wireless = 2,
    Dummy = 3,
    Bond = 4,
    Vlan = 5,
    Bridge = 6,
}

/// Network device state.
#[derive(
    Default,
    Serialize,
    Deserialize,
    Debug,
    PartialEq,
    Eq,
    Clone,
    Copy,
    strum::Display,
    strum::EnumString,
    utoipa::ToSchema,
)]
#[strum(serialize_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub enum DeviceState {
    #[default]
    /// The device's state is unknown.
    Unknown,
    /// The device is recognized but not managed by Agama.
    Unmanaged,
    /// The device is detected but it cannot be used (wireless switched off, missing firmware, etc.).
    Unavailable,
    /// The device is connecting to the network.
    Connecting,
    /// The device is successfully connected to the network.
    Connected,
    /// The device is disconnecting from the network.
    Disconnecting,
    /// The device is disconnected from the network.
    Disconnected,
    /// The device failed to connect to a network.
    Failed,
}

#[derive(
    Default,
    Serialize,
    Deserialize,
    Debug,
    PartialEq,
    Eq,
    Clone,
    Copy,
    strum::Display,
    strum::EnumString,
    utoipa::ToSchema,
)]
#[strum(serialize_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub enum ConnectionState {
    /// The connection is getting activated.
    Activating,
    /// The connection is activated.
    Activated,
    /// The connection is getting deactivated.
    Deactivating,
    #[default]
    /// The connection is deactivated.
    Deactivated,
}

#[derive(Debug, Default, Clone, Copy, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub enum Status {
    #[default]
    Up,
    Down,
    Removed,
    // Workaound for not modify the connection status
    Keep,
}

impl fmt::Display for Status {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let name = match &self {
            Status::Up => "up",
            Status::Down => "down",
            Status::Keep => "keep",
            Status::Removed => "removed",
        };
        write!(f, "{}", name)
    }
}

#[derive(Debug, Error, PartialEq)]
#[error("Invalid status: {0}")]
pub struct InvalidStatus(String);

impl TryFrom<&str> for Status {
    type Error = InvalidStatus;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "up" => Ok(Status::Up),
            "down" => Ok(Status::Down),
            "keep" => Ok(Status::Keep),
            "removed" => Ok(Status::Removed),
            _ => Err(InvalidStatus(value.to_string())),
        }
    }
}

// https://networkmanager.dev/docs/api/latest/nm-dbus-types.html#NMSettingsConnectionFlags
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, Copy, utoipa::ToSchema)]
pub enum ConnectionFlags {
    None = 0,
    Unsaved = 0x01,
    NmGenerated = 0x02,
    Volatile = 0x03,
    External = 0x04,
}

#[derive(Debug, Error, PartialEq)]
#[error("Invalid connection flag: {0}")]
pub struct InvalidConnectionFlag(u32);

impl TryFrom<u32> for ConnectionFlags {
    type Error = InvalidConnectionFlag;

    fn try_from(value: u32) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(ConnectionFlags::None),
            0x1 => Ok(ConnectionFlags::Unsaved),
            0x2 => Ok(ConnectionFlags::NmGenerated),
            0x3 => Ok(ConnectionFlags::Volatile),
            0x4 => Ok(ConnectionFlags::External),
            _ => Err(InvalidConnectionFlag(value)),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, Copy, utoipa::ToSchema)]
pub enum AddFlags {
    None = 0,
    ToDisk = 0x1,
    InMemory = 0x2,
    BlockAutoconnect = 0x20,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, Copy, utoipa::ToSchema)]
pub enum UpdateFlags {
    None = 0,
    ToDisk = 0x1,
    InMemory = 0x2,
    InMemoryDetached = 0x4,
    InMemoryOnly = 0x8,
    Volatile = 0x10,
    BlockAutoconnect = 0x20,
    NoReapply = 0x40,
}

/// Bond mode
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, Copy, utoipa::ToSchema)]
pub enum BondMode {
    #[serde(rename = "balance-rr")]
    RoundRobin = 0,
    #[serde(rename = "active-backup")]
    ActiveBackup = 1,
    #[serde(rename = "balance-xor")]
    BalanceXOR = 2,
    #[serde(rename = "broadcast")]
    Broadcast = 3,
    #[serde(rename = "802.3ad")]
    LACP = 4,
    #[serde(rename = "balance-tlb")]
    BalanceTLB = 5,
    #[serde(rename = "balance-alb")]
    BalanceALB = 6,
}
impl Default for BondMode {
    fn default() -> Self {
        Self::RoundRobin
    }
}

impl std::fmt::Display for BondMode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            match self {
                BondMode::RoundRobin => "balance-rr",
                BondMode::ActiveBackup => "active-backup",
                BondMode::BalanceXOR => "balance-xor",
                BondMode::Broadcast => "broadcast",
                BondMode::LACP => "802.3ad",
                BondMode::BalanceTLB => "balance-tlb",
                BondMode::BalanceALB => "balance-alb",
            }
        )
    }
}

#[derive(Debug, Error, PartialEq)]
#[error("Invalid bond mode: {0}")]
pub struct InvalidBondMode(String);

impl TryFrom<&str> for BondMode {
    type Error = InvalidBondMode;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "balance-rr" => Ok(BondMode::RoundRobin),
            "active-backup" => Ok(BondMode::ActiveBackup),
            "balance-xor" => Ok(BondMode::BalanceXOR),
            "broadcast" => Ok(BondMode::Broadcast),
            "802.3ad" => Ok(BondMode::LACP),
            "balance-tlb" => Ok(BondMode::BalanceTLB),
            "balance-alb" => Ok(BondMode::BalanceALB),
            _ => Err(InvalidBondMode(value.to_string())),
        }
    }
}
impl TryFrom<u8> for BondMode {
    type Error = InvalidBondMode;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(BondMode::RoundRobin),
            1 => Ok(BondMode::ActiveBackup),
            2 => Ok(BondMode::BalanceXOR),
            3 => Ok(BondMode::Broadcast),
            4 => Ok(BondMode::LACP),
            5 => Ok(BondMode::BalanceTLB),
            6 => Ok(BondMode::BalanceALB),
            _ => Err(InvalidBondMode(value.to_string())),
        }
    }
}

impl From<InvalidBondMode> for zbus::fdo::Error {
    fn from(value: InvalidBondMode) -> zbus::fdo::Error {
        zbus::fdo::Error::Failed(format!("Network error: {value}"))
    }
}

#[derive(Debug, Error, PartialEq)]
#[error("Invalid device type: {0}")]
pub struct InvalidDeviceType(u8);

impl TryFrom<u8> for DeviceType {
    type Error = InvalidDeviceType;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(DeviceType::Loopback),
            1 => Ok(DeviceType::Ethernet),
            2 => Ok(DeviceType::Wireless),
            3 => Ok(DeviceType::Dummy),
            4 => Ok(DeviceType::Bond),
            5 => Ok(DeviceType::Vlan),
            6 => Ok(DeviceType::Bridge),
            _ => Err(InvalidDeviceType(value)),
        }
    }
}

impl From<InvalidDeviceType> for zbus::fdo::Error {
    fn from(value: InvalidDeviceType) -> zbus::fdo::Error {
        zbus::fdo::Error::Failed(format!("Network error: {value}"))
    }
}

// FIXME: found a better place for the HTTP types.
//
// TODO: If the client ignores the additional "state" field, this struct
// does not need to be here.
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct NetworkConnectionWithState {
    #[serde(flatten)]
    pub connection: NetworkConnection,
    pub state: ConnectionState,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_display_ssid() {
        let ssid = SSID(vec![97, 103, 97, 109, 97]);
        assert_eq!(format!("{}", ssid), "agama");
    }

    #[test]
    fn test_ssid_to_vec() {
        let vec = vec![97, 103, 97, 109, 97];
        let ssid = SSID(vec.clone());
        assert_eq!(ssid.to_vec(), &vec);
    }

    #[test]
    fn test_device_type_from_u8() {
        let dtype = DeviceType::try_from(0);
        assert_eq!(dtype, Ok(DeviceType::Loopback));

        let dtype = DeviceType::try_from(128);
        assert_eq!(dtype, Err(InvalidDeviceType(128)));
    }

    #[test]
    fn test_display_bond_mode() {
        let mode = BondMode::try_from(1).unwrap();
        assert_eq!(format!("{}", mode), "active-backup");
    }
}
