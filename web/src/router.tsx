/*
 * Copyright (c) [2024] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import React from "react";
import { createHashRouter, Outlet } from "react-router-dom";
import App from "~/App";
import Protected from "~/Protected";
import { FullLayout, PlainLayout } from "~/components/layout";
import {
  InstallationExit,
  InstallationFinished,
  InstallationProgress,
  LoginPage,
} from "~/components/core";
import StorageProgress from "~/components/storage/Progress";
import { OverviewPage } from "~/components/overview";
import l10nRoutes from "~/routes/l10n";
import networkRoutes from "~/routes/network";
import productsRoutes from "~/routes/products";
import registrationRoutes from "~/routes/registration";
import storageRoutes from "~/routes/storage";
import softwareRoutes from "~/routes/software";
import usersRoutes from "~/routes/users";
import { HOSTNAME, ROOT as PATHS, STORAGE } from "./routes/paths";
import { N_ } from "~/i18n";
import HostnamePage from "./components/system/HostnamePage";

const rootRoutes = () => [
  {
    path: "/overview",
    element: <OverviewPage />,
    handle: { name: N_("Overview"), icon: "list_alt", alsoActiveOn: ["/"] },
  },
  {
    path: HOSTNAME.root,
    element: <HostnamePage />,
    handle: { name: N_("Hostname"), icon: "fingerprint" },
  },
  registrationRoutes(),
  l10nRoutes(),
  networkRoutes(),
  storageRoutes(),
  softwareRoutes(),
  usersRoutes(),
];

const protectedRoutes = () => [
  {
    path: PATHS.root,
    element: <App />,
    children: [
      {
        element: <FullLayout />,
        children: [
          {
            index: true,
            element: <OverviewPage />,
          },
          ...rootRoutes(),
        ],
      },
      {
        element: <PlainLayout />,
        children: [productsRoutes()],
      },
    ],
  },
  {
    element: (
      <PlainLayout>
        <Outlet />
      </PlainLayout>
    ),
    children: [
      {
        path: PATHS.installationProgress,
        element: <InstallationProgress />,
      },
      {
        path: PATHS.installationFinished,
        element: <InstallationFinished />,
      },
      {
        path: STORAGE.progress,
        element: <StorageProgress />,
      },
    ],
  },
];

const router = () =>
  createHashRouter([
    {
      path: PATHS.login,
      element: (
        <PlainLayout mountHeader={false} mountSkipToContent={false}>
          <LoginPage />
        </PlainLayout>
      ),
    },
    {
      element: (
        <PlainLayout mountHeader={false} mountSkipToContent={false}>
          <Outlet />
        </PlainLayout>
      ),
      children: [
        {
          path: PATHS.installationExit,
          element: <InstallationExit />,
        },
      ],
    },
    {
      path: PATHS.root,
      element: <Protected />,
      children: [...protectedRoutes()],
    },
  ]);

export { router, rootRoutes, PATHS };
