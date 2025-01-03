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

import React, { useState } from "react";
import {
  FormGroup,
  FormSelect,
  FormSelectOption,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  Popover,
  Radio,
  Select,
  SelectOption,
  SelectList,
  Split,
  Stack,
  TextInput,
  FormSelectProps,
} from "@patternfly/react-core";
import { FormValidationError, FormReadOnlyField, NumericTextInput } from "~/components/core";
import { Icon } from "~/components/layout";
import { _, N_ } from "~/i18n";
import { sprintf } from "sprintf-js";
import { SIZE_METHODS, SIZE_UNITS } from "~/components/storage/utils";
import { Volume } from "~/types/storage";

const { K, ...MAX_SIZE_UNITS } = SIZE_UNITS;

export type MountPathFieldProps = {
  value?: string;
  isReadOnly?: boolean;
  onChange: (mountPath: string) => void;
  error?: React.ReactNode;
};

/**
 * Field for the mount path of a volume.
 * @component
 */
const MountPathField = ({
  value = "",
  onChange,
  isReadOnly = false,
  error,
}: MountPathFieldProps) => {
  const label = _("Mount point");

  const changeMountPath: (_, mountPath: string) => void = (_, mountPath) => onChange(mountPath);

  if (isReadOnly) {
    return <FormReadOnlyField label={label}>{value}</FormReadOnlyField>;
  }

  return (
    <FormGroup isRequired fieldId="mountPath" label={_("Mount point")}>
      <TextInput
        id="mountPath"
        name="mountPath"
        value={value}
        label={_("Mount point")}
        onChange={changeMountPath}
        validated={error ? "error" : "default"}
      />
      <FormValidationError message={error} />
    </FormGroup>
  );
};

/**
 * Form control for selecting a size unit
 * @component
 *
 * Based on {@link PF/FormSelect https://www.patternfly.org/components/forms/form-select}
 *
 * @param {object} props
 * @param props.units - a collection of size units
 * @param props.formSelectProps
 */
const SizeUnitFormSelect = ({
  units,
  ...formSelectProps
}: {
  units: Array<string>;
  formSelectProps: FormSelectProps;
}) => {
  return (
    <FormSelect {...formSelectProps}>
      {units.map((unit) => {
        // unit values are marked for translation in the utils.js file
        // eslint-disable-next-line agama-i18n/string-literals
        return <FormSelectOption key={unit} value={unit} label={_(unit)} />;
      })}
    </FormSelect>
  );
};

/**
 * Possible file system type options for a volume.
 */
const fsOptions = (volume: Volume): string[] => {
  return volume.outline.fsTypes;
};

/**
 * Option for selecting a file system type.
 * @component
 */
const FsSelectOption = ({ fsOption }: { fsOption: string }) => {
  return (
    <SelectOption value={fsOption}>
      <strong>{fsOption}</strong>
    </SelectOption>
  );
};

/**
 * Widget for selecting a file system type.
 * @component
 *
 * @param props
 * @param props.id - Widget id.
 * @param props.value - Currently selected file system.
 * @param props.volume - The selected storage volume.
 * @param props.isDisabled
 * @param props.onChange - Callback for notifying input changes.
 */
const FsSelect = ({
  id,
  value,
  volume,
  isDisabled,
  onChange,
}: {
  id: string;
  value: string;
  volume: Volume;
  isDisabled: boolean;
  onChange: (data: object) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = fsOptions(volume);
  const selected = value;

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event, option) => {
    setIsOpen(false);
    onChange({ fsType: option });
  };

  const toggle = (toggleRef) => {
    return (
      <MenuToggle
        id={id}
        ref={toggleRef}
        onClick={onToggleClick}
        isExpanded={isOpen}
        className="full-width"
        isDisabled={isDisabled}
      >
        {selected}
      </MenuToggle>
    );
  };

  return (
    <Select
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={setIsOpen}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {options.map((option, index) => (
          <FsSelectOption key={index} fsOption={option} />
        ))}
      </SelectList>
    </Select>
  );
};

type FsFieldProps = {
  value: string;
  volume: Volume;
  isDisabled?: boolean;
  onChange: (data: object) => void;
};

/**
 * Widget for rendering the file system configuration.
 *
 * Allows selecting a file system type. If there is only one possible option, then it renders plain
 * text with the unique option.
 * @component
 */
const FsField = ({ value, volume, isDisabled = false, onChange }: FsFieldProps) => {
  const isSingleFs = () => {
    // check for btrfs with snapshots
    if (volume.fsType === "Btrfs" && volume.snapshots) {
      return true;
    }

    const { fsTypes } = volume.outline;
    return fsTypes.length === 1;
  };

  const Info = () => {
    // TRANSLATORS: info about possible file system types.
    const text = _(
      "The options for the file system type depends on the product and the mount point.",
    );

    return (
      <Popover showClose={false} bodyContent={text} maxWidth="18em">
        <button
          type="button"
          aria-label={_("More info for file system types")}
          onClick={(e) => e.preventDefault()}
          className="pf-v5-c-form__group-label-help"
        >
          <Icon name="info" size="xxs" />
        </button>
      </Popover>
    );
  };

  // TRANSLATORS: label for the file system selector.
  const label = _("File system type");

  if (isSingleFs()) {
    return <FormReadOnlyField label={label}>{value}</FormReadOnlyField>;
  }

  return (
    <FormGroup isRequired label={label} labelIcon={<Info />} fieldId="fsType">
      <FsSelect
        id="fsType"
        value={value}
        volume={volume}
        isDisabled={isDisabled}
        onChange={onChange}
      />
    </FormGroup>
  );
};

/**
 * Widget for rendering the size option content when SIZE_UNITS.AUTO is selected
 * @component
 *
 * @param {object} props
 * @param {Volume} props.volume - a storage volume object
 */
const SizeAuto = ({ volume }: { volume: Volume }) => {
  const conditions = [];

  if (volume.outline.snapshotsAffectSizes)
    // TRANSLATORS: item which affects the final computed partition size
    conditions.push(_("the configuration of snapshots"));

  if (volume.outline.sizeRelevantVolumes && volume.outline.sizeRelevantVolumes.length > 0)
    // TRANSLATORS: item which affects the final computed partition size
    // %s is replaced by a list of mount points like "/home, /boot"
    conditions.push(
      sprintf(
        _("the presence of the file system for %s"),
        // TRANSLATORS: conjunction for merging two list items
        volume.outline.sizeRelevantVolumes.join(_(", ")),
      ),
    );

  if (volume.outline.adjustByRam)
    // TRANSLATORS: item which affects the final computed partition size
    conditions.push(_("the amount of RAM in the system"));

  // TRANSLATORS: the %s is replaced by the items which affect the computed size
  const conditionsText = sprintf(
    _("The final size depends on %s."),
    // TRANSLATORS: conjunction for merging two texts
    conditions.join(_(" and ")),
  );

  return (
    <>
      {/* TRANSLATORS: the partition size is automatically computed */}
      <p>
        {_("Automatically calculated size according to the selected product.")} {conditionsText}
      </p>
    </>
  );
};

/**
 * Widget for rendering the size option content when SIZE_UNITS.MANUAL is selected
 * @component
 *
 * @param props
 * @param props.errors - the form errors
 * @param props.formData - the form data
 * @param props.isDisabled
 * @param props.onChange - callback for notifying input changes
 */
const SizeManual = ({
  errors,
  formData,
  isDisabled,
  onChange,
}: {
  errors;
  formData;
  isDisabled: boolean;
  onChange: (v: object) => void;
}) => {
  return (
    <Stack hasGutter>
      <p>{_("Exact size for the file system.")}</p>
      <FormGroup fieldId="size" isRequired>
        <InputGroup className="size-input-group">
          <InputGroupItem>
            <NumericTextInput
              id="size"
              name="size"
              // TRANSLATORS: requested partition size
              aria-label={_("Exact size")}
              // TODO: support also localization for numbers, e.g. decimal comma,
              // either use toLocaleString()
              //   (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)
              // or use the "globalize" JS library which can also parse the localized string back
              //   (https://github.com/globalizejs/globalize#number-module)
              value={formData.minSize}
              onChange={(minSize) => onChange({ minSize })}
              validated={errors.minSize ? "error" : "default"}
              isDisabled={isDisabled}
            />
          </InputGroupItem>
          <InputGroupItem>
            <SizeUnitFormSelect
              /** @ts-expect-error: for some reason using id makes TS complain */
              id="sizeUnit"
              // TRANSLATORS: units selector (like KiB, MiB, GiB...)
              aria-label={_("Size unit")}
              units={Object.values(SIZE_UNITS)}
              value={formData.minSizeUnit}
              onChange={(_, minSizeUnit) => onChange({ minSizeUnit })}
              isDisabled={isDisabled}
            />
          </InputGroupItem>
        </InputGroup>
        <FormValidationError message={errors.size} />
      </FormGroup>
    </Stack>
  );
};

/**
 * Widget for rendering the size option content when SIZE_UNITS.RANGE is selected
 * @component
 *
 * @param props
 * @param props.errors - the form errors
 * @param props.formData - the form data
 * @param props.isDisabled
 * @param props.onChange - callback for notifying input changes
 */
const SizeRange = ({
  errors,
  formData,
  isDisabled,
  onChange,
}: {
  errors;
  formData;
  isDisabled: boolean;
  onChange: (v: object) => void;
}) => {
  return (
    <Stack hasGutter>
      <p>
        {_(
          "Limits for the file system size. The final size will be a value between the given minimum \
and maximum. If no maximum is given then the file system will be as big as possible.",
        )}
      </p>
      <Split hasGutter>
        <FormGroup
          isRequired
          // TRANSLATORS: the minimal partition size
          label={_("Minimum")}
          fieldId="minSize"
          className="size-input-group"
        >
          <InputGroup>
            <InputGroupItem>
              <NumericTextInput
                id="minSize"
                name="minSize"
                // TRANSLATORS: the minium partition size
                aria-label={_("Minimum desired size")}
                value={formData.minSize}
                onChange={(minSize) => onChange({ minSize })}
                validated={errors.minSize ? "error" : "default"}
                isDisabled={isDisabled}
              />
            </InputGroupItem>
            <InputGroupItem>
              <SizeUnitFormSelect
                /** @ts-expect-error: for some reason using id makes TS complain */
                id="minSizeUnit"
                aria-label={_("Unit for the minimum size")}
                units={Object.values(SIZE_UNITS)}
                value={formData.minSizeUnit}
                onChange={(_, minSizeUnit) => onChange({ minSizeUnit })}
                isDisabled={isDisabled}
              />
            </InputGroupItem>
          </InputGroup>
          <FormValidationError message={errors.minSize} />
        </FormGroup>
        <FormGroup
          // TRANSLATORS: the maximum partition size
          label={_("Maximum")}
          fieldId="maxSize"
          className="size-input-group"
        >
          <InputGroup>
            <InputGroupItem>
              <NumericTextInput
                id="maxSize"
                name="maxSize"
                validated={errors.maxSize ? "error" : "default"}
                // TRANSLATORS: the maximum partition size
                aria-label={_("Maximum desired size")}
                value={formData.maxSize}
                onChange={(maxSize) => onChange({ maxSize })}
                isDisabled={isDisabled}
              />
            </InputGroupItem>
            <InputGroupItem>
              <SizeUnitFormSelect
                /** @ts-expect-error: for some reason using id makes TS complain */
                id="maxSizeUnit"
                aria-label={_("Unit for the maximum size")}
                units={Object.values(MAX_SIZE_UNITS)}
                value={formData.maxSizeUnit || formData.minSizeUnit}
                onChange={(_, maxSizeUnit) => onChange({ maxSizeUnit })}
                isDisabled={isDisabled}
              />
            </InputGroupItem>
          </InputGroup>
          <FormValidationError message={errors.maxSize} />
        </FormGroup>
      </Split>
    </Stack>
  );
};

// constants need to be marked for translation with N_() and translated with _() later
const SIZE_OPTION_LABELS = Object.freeze({
  // TRANSLATORS: radio button label, fully automatically computed partition size, no user input
  auto: N_("Auto"),
  // TRANSLATORS: radio button label, exact partition size requested by user
  fixed: N_("Fixed"),
  // TRANSLATORS: radio button label, automatically computed partition size within the user provided min and max limits
  range: N_("Range"),
});

/**
 * Widget for rendering the volume size options
 * @component
 */

type SizeOptionsFieldProps = {
  volume: Volume;
  formData;
  errors?: object;
  isDisabled?: boolean;
  onChange: (v: object) => void;
};

const SizeOptionsField = ({
  volume,
  formData,
  isDisabled = false,
  errors = {},
  onChange,
}: SizeOptionsFieldProps) => {
  const { sizeMethod } = formData;
  const sizeWidgetProps = { errors, formData, volume, isDisabled, onChange };

  const sizeOptions: string[] = [SIZE_METHODS.MANUAL, SIZE_METHODS.RANGE];

  if (volume.outline.supportAutoSize) sizeOptions.push(SIZE_METHODS.AUTO);

  return (
    <FormGroup role="radiogroup" fieldId="size" label={_("Size")} isRequired>
      <div>
        <Split hasGutter className="radio-group">
          {sizeOptions.map((value) => {
            const isSelected = sizeMethod === value;

            return (
              <Radio
                id={value}
                key={`size-${value}`}
                // eslint-disable-next-line agama-i18n/string-literals
                label={_(SIZE_OPTION_LABELS[value] || value)}
                value={value}
                name="size-option"
                className={isSelected && "selected"}
                isChecked={isSelected}
                onChange={() => onChange({ sizeMethod: value })}
                isDisabled={isDisabled}
              />
            );
          })}
        </Split>

        <div aria-live="polite" className="highlighted-live-region">
          {sizeMethod === SIZE_METHODS.AUTO && <SizeAuto {...sizeWidgetProps} />}
          {sizeMethod === SIZE_METHODS.RANGE && <SizeRange {...sizeWidgetProps} />}
          {sizeMethod === SIZE_METHODS.MANUAL && <SizeManual {...sizeWidgetProps} />}
        </div>
      </div>
    </FormGroup>
  );
};

export { FsField, MountPathField, SizeOptionsField };
