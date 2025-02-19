/*
 * Copyright (c) [2023-2024] SUSE LLC
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
import { TextInput, TextInputProps } from "@patternfly/react-core";
import { noop } from "~/utils";

type NumericTextInputProps = {
  value: string | number;
  onChange: (value: string | number) => void;
} & Omit<TextInputProps, "value" | "onChange">;

/**
 * Helper component for having an input text limited to not signed numbers
 * @component
 *
 * Based on {@link https://www.patternfly.org/components/forms/text-input PF/TextInput}
 *
 * @note It allows empty value too.
 */
export default function NumericTextInput({
  value = "",
  onChange = noop,
  ...textInputProps
}: NumericTextInputProps) {
  // NOTE: Using \d* instead of \d+ at the beginning to allow empty
  const pattern = /^\d*\.?\d*$/;

  const handleOnChange: TextInputProps["onChange"] = (_, value) => {
    if (pattern.test(value)) {
      onChange(value);
    }
  };

  return <TextInput {...textInputProps} value={value} onChange={handleOnChange} />;
}
