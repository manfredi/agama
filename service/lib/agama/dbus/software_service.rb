# frozen_string_literal: true

# Copyright (c) [2022-2023] SUSE LLC
#
# All Rights Reserved.
#
# This program is free software; you can redistribute it and/or modify it
# under the terms of version 2 of the GNU General Public License as published
# by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
# more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, contact SUSE LLC.
#
# To contact SUSE LLC about this file by physical or electronic mail, you may
# find current contact information at www.suse.com.

require "dbus"
require "agama/dbus/bus"
require "agama/dbus/clients/locale"
require "agama/dbus/software"
require "agama/software"

require "yast"
Yast.import "Pkg"
Yast.import "Language"

module Agama
  module DBus
    # D-Bus service (org.opensuse.Agama.Software1)
    #
    # It connects to the system D-Bus and answers requests on objects below
    # `/org/opensuse/Agama/Software1`.
    class SoftwareService
      SERVICE_NAME = "org.opensuse.Agama.Software1"
      private_constant :SERVICE_NAME

      # D-Bus connection
      #
      # @return [::DBus::BusConnection]
      attr_reader :bus

      # @param config [Config] Configuration object
      # @param logger [Logger]
      def initialize(config, logger = nil)
        @logger = logger || Logger.new($stdout)
        @bus = Bus.current
        @backend = Agama::Software::Manager.new(config, logger)
      end

      # Starts software service. It does more then just #export method.
      def start
        # for some reason the the "export" method must be called before
        # registering the language change callback to work properly
        export
      end

      # Exports the software object through the D-Bus service
      def export
        dbus_objects.each { |o| service.export(o) }
        paths = dbus_objects.map(&:path).join(", ")
        logger.info "Exported #{paths} objects"
      end

      # Call this from some main loop to dispatch the D-Bus messages
      def dispatch
        bus.dispatch_message_queue
      end

    private

      # @return [Logger]
      attr_reader :logger, :backend

      # @return [::DBus::ObjectServer]
      def service
        @service ||= bus.request_service(SERVICE_NAME)
      end

      # @return [Array<::DBus::Object>]
      def dbus_objects
        @dbus_objects ||= [
          Agama::DBus::Software::Manager.new(@backend, logger),
          Agama::DBus::Software::Product.new(@backend, logger),
          Agama::DBus::Software::Proposal.new(logger)
        ]
      end
    end
  end
end
