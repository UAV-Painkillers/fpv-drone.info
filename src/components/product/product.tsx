import { Link } from "@builder.io/qwik-city";
import { ExpandableImage } from "../expandable-image/expandable-image";
import { PageHeadline } from "../page-headline/page-headline";
import { component$ } from "@builder.io/qwik";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import styles from "./product.module.css";
import { formatHtmlText } from "~/utils/formatHtmlText";
import type { TableColumns, TableData } from "../table/table";
import { Table } from "../table/table";

enum ProductCategory {
  FlightController = "Flight Controller",
  ESC = "ESC",
  Stack = "Stack",
  Motor = "Motor",
  Propeller = "Propeller",
  Frame = "Frame",
  Camera = "Camera",
  VTX = "VTX",
  RX = "RX",
  Battery = "Battery",
  Charger = "Charger",
  PowerDistributionBoard = "Power Distribution Board",
  Antenna = "Antenna",
  GPS = "GPS",
  LED = "LED",
}

enum ProductFlightControllerGyro {
  BMI270 = "BMI270",
  MPU6000 = "MPU6000",
  ICM42688P = "ICM42688P",
}

enum ProductFlightControllerProcessor {
  STM32F405 = "STM32F405",
}

enum ProductFlightControllerBlackboxType {
  NONE = "None",
  SD_CARD = "SD Card",
  FLASH = "Flash",
}

enum ProductFlightControllerOnboardRx {
  NONE = "None",
  IBUS = "IBUS",
  SBUS = "SBUS",
  CRSF = "Crossfire",
  ELRS = "ExpressLRS",
  FRSKY = "FrSky",
  DSMX = "DSMX",
  FUTABA = "Futaba",
}

enum ProductFlightControllerOnboardVtx {
  NONE = "None",
  Analog = "Analog",
  DJI = "DJI",
  HDZero = "HDZero",
  Walksnail = "Walksnail",
}

enum ProductFlightControllerUsbType {
  MICRO = "Micro",
  USB_C = "USB-C",
}

interface MountingPatterns {
  m2_20x20: boolean;
  m2_25x25: boolean;
  m2_30_5x30_5: boolean;
  m3_20x20: boolean;
  m3_25x25: boolean;
  m3_30_5x30_5: boolean;
}

interface TechnicalSpecsFlightController {
  processor: ProductFlightControllerProcessor;
  gyro: ProductFlightControllerGyro;
  mountingPattern: MountingPatterns;
  betaflightTarget: string;
  usbType: ProductFlightControllerUsbType;
  hardwareUartCount: number;
  hardwareUartCountReserved: number;
  ledStripPadCount: number;
  blackboxType: ProductFlightControllerBlackboxType;
  blackboxSizeInMb?: number;
  analogOsdChip: boolean;
  onboardBarometer: boolean;
  onboardCompass: boolean;
  motorOutputs: number;
  onboardRx: ProductFlightControllerOnboardRx;
  onboardVtx: ProductFlightControllerOnboardVtx;
  onboardVtxPower?: number;
}

enum ProductESCFirmware {
  BLHeli_32 = "BLHeli_32",
  BLHeli_S = "BLHeli_S",
  KISS = "KISS",
  Bluejay = "Bluejay",
}

interface TechnicalSpecsESC {
  firmware: ProductESCFirmware;
  firmwareTarget?: string;
  continuousCurrentInA: number;
  burstCurrentInA: number;
  tvsProtectiveDiode: boolean;
  powerInputMinVoltage: number;
  powerInputMinS: number;
  powerInputMaxVoltage: number;
  powerInputMaxS: number;
  mountingPattern: MountingPatterns;
}

export interface ProductProps {
  manufacturer: string;
  name: string;
  description?: string;
  officialUrl?: string;
  imageUrl?: string;
  category: ProductCategory;
  technicalSpecs?: {
    generic?: Array<{ name: string; value: string }>;
    flightController?: TechnicalSpecsFlightController;
    esc?: TechnicalSpecsESC;
  };
  manuals?: Array<{ label: string; pdf?: string; image?: string }>;
}

type SpecPropTypes = keyof Required<ProductProps>["technicalSpecs"];

export const Product = component$((props: ProductProps) => {
  const descriptionHtml = formatHtmlText(props.description ?? "");

  const hasGenericTechnicalSpecs =
    (props.technicalSpecs?.generic?.length ?? 0) > 0;

  function specPropExists(specKey: SpecPropTypes) {
    const technicalSpecs = props.technicalSpecs ?? {};
    return Object.values(technicalSpecs[specKey] ?? {}).some(
      (v) => v !== undefined || v !== null
    );
  }

  const hasFlightControllerTechnicalSpecs = specPropExists("flightController");
  const hasESCTechnicalSpecs = specPropExists("esc");

  const hasTechnicalSpecs =
    hasGenericTechnicalSpecs || hasFlightControllerTechnicalSpecs;

  const hasMoreThanOneTechnicalSpecsSection =
    [hasFlightControllerTechnicalSpecs, hasESCTechnicalSpecs].filter(Boolean)
      .length > 1;

  function specKeyToInputFriendlyName(
    key: string,
    specType: SpecPropTypes
  ): string {
    const mainInputs = ProductRegistryDefinition.inputs!.find(
      (input) => input.name === "technicalSpecs"
    )!.subFields!.find((subField) => subField.name === specType)!.subFields!;

    const keyParts = key.split(".");
    const firstKeyPart = keyParts.shift()!;
    let parentInput = mainInputs.find((input) => input.name === firstKeyPart);
    if (!parentInput) {
      return key;
    }

    while (keyParts.length > 0) {
      const nextKeyPart = keyParts.shift()!;
      parentInput = parentInput.subFields!.find(
        (input) => input.name === nextKeyPart
      );
      if (!parentInput) {
        return key;
      }
    }

    return parentInput.friendlyName ?? key;
  }

  function pushSpecDefinitionInToTable<TSpecPropType extends SpecPropTypes>(
    specProps: Required<ProductProps>["technicalSpecs"][TSpecPropType],
    specKey: TSpecPropType,
    tableData: TableData
  ) {
    Object.entries(specProps ?? {}).forEach(([key, value]) => {
      // combine all mountingPattern inputs into one row
      if (key === "mountingPattern") {
        const acceptedPatterns = Object.entries(
          value as Record<string, boolean>
        )
          .filter(([, value]) => value)
          .map(([key]) =>
            specKeyToInputFriendlyName("mountingPattern." + key, specKey)
          );

        if (acceptedPatterns.length === 0) {
          return;
        }

        const friendlyKeyName = specKeyToInputFriendlyName(key, specKey);
        const combinedValue = acceptedPatterns.join(", ");
        tableData.push({
          __isHeadline__: false,
          specification: friendlyKeyName,
          value: combinedValue,
        });
        return;
      }

      tableData.push({
        __isHeadline__: false,
        specification: specKeyToInputFriendlyName(key, specKey),
        value: value as string,
      });
    });
  }

  const flightControllerTechnicalSpecsTableData: TableData = [];
  if (hasFlightControllerTechnicalSpecs) {
    if (hasMoreThanOneTechnicalSpecsSection) {
      flightControllerTechnicalSpecsTableData.push({
        __isHeadline__: true,
        specification: "Flight Controller",
        value: "",
      });
    }

    pushSpecDefinitionInToTable(
      props.technicalSpecs!.flightController!,
      "flightController",
      flightControllerTechnicalSpecsTableData
    );
  }

  const escTechnicalSpecsTableData: TableData = [];
  if (hasESCTechnicalSpecs) {
    if (hasMoreThanOneTechnicalSpecsSection) {
      escTechnicalSpecsTableData.push({
        __isHeadline__: true,
        specification: "ESC",
        value: "",
      });
    }

    pushSpecDefinitionInToTable(
      props.technicalSpecs!.esc!,
      "esc",
      escTechnicalSpecsTableData
    );
  }

  const genericTechnicalSpecsTableData: TableData = [];
  if (hasGenericTechnicalSpecs) {
    if (hasMoreThanOneTechnicalSpecsSection) {
      genericTechnicalSpecsTableData.push({
        __isHeadline__: true,
        specification: "Generic",
        value: "",
      });
    }

    props.technicalSpecs?.generic?.forEach((spec) => {
      genericTechnicalSpecsTableData.push({
        __isHeadline__: false,
        specification: spec.name,
        value: spec.value,
      });
    });
  }

  const specTableColumns: TableColumns = [
    {
      key: "specification",
      label: "Specification",
    },
    {
      key: "value",
      label: "Value",
    },
  ];

  const specTableDefinitions: Array<{
    columns: TableColumns;
    data: TableData;
  }> = [];

  if (hasFlightControllerTechnicalSpecs) {
    specTableDefinitions.push({
      columns: specTableColumns,
      data: flightControllerTechnicalSpecsTableData,
    });
  }

  if (hasESCTechnicalSpecs) {
    specTableDefinitions.push({
      columns: specTableColumns,
      data: escTechnicalSpecsTableData,
    });
  }

  if (hasGenericTechnicalSpecs) {
    specTableDefinitions.push({
      columns: specTableColumns,
      data: genericTechnicalSpecsTableData,
    });
  }

  return (
    <div>
      <PageHeadline title={props.manufacturer} subtitle={props.name} />
      <section>
        <div>
          <small>Category: {props.category}</small>
          <smal> | </smal>
          {props.officialUrl && (
            <small>
              <Link href={props.officialUrl} target="_blank" class="anchor">
                Official Website
              </Link>
            </small>
          )}
        </div>
        <ExpandableImage
          src={props.imageUrl}
          alt={`Image of ${props.manufacturer} ${props.name}`}
          class={styles.image}
        />
        {descriptionHtml && (
          <>
            <h3>Description</h3>
            <div dangerouslySetInnerHTML={descriptionHtml} />
          </>
        )}
      </section>

      {hasTechnicalSpecs && (
        <section>
          <h3>Technical Specifications</h3>

          {specTableDefinitions.map(({ columns, data }, index) => (
            <Table
              key={`spec-table-${index}`}
              columns={columns}
              data={data}
              showColumnHeaders={!hasMoreThanOneTechnicalSpecsSection}
              class={styles.specTable}
            />
          ))}
        </section>
      )}

      {(props.manuals?.length ?? 0) > 0 && (
        <section>
          <h3>Manuals</h3>
          {props.manuals?.map(({ label, pdf, image }, index) => (
            <div key={`manual-${label}-${index}`}>
              {pdf && (
                <Link href={pdf} target="_blank" download class="anchor">
                  Download {label} PDF
                </Link>
              )}

              {image && (
                <>
                  <Link href={image} target="_blank" download class="anchor">
                    Download {label} Image
                  </Link>
                  <ExpandableImage
                    src={image}
                    alt={`Image of ${label}`}
                    class={styles.manualsImage}
                  />
                </>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
});

const mountingPatternInput = {
  name: "mountingPattern",
  friendlyName: "Mounting Pattern",
  type: "object",
  required: true,
  defaultValue: {},
  subFields: [
    {
      name: "m2_20x20",
      friendlyName: "M2 20x20",
      type: "boolean",
      required: false,
    },
    {
      name: "m2_25x25",
      friendlyName: "M2 25x25",
      type: "boolean",
      required: false,
    },
    {
      name: "m2_30_5x30_5",
      friendlyName: "M2 30.5x30.5",
      type: "boolean",
      required: false,
    },
    {
      name: "m3_20x20",
      friendlyName: "M3 20x20",
      type: "boolean",
      required: false,
    },
    {
      name: "m3_25x25",
      friendlyName: "M3 25x25",
      type: "boolean",
      required: false,
    },
    {
      name: "m3_30_5x30_5",
      friendlyName: "M3 30.5x30.5",
      type: "boolean",
      required: false,
    },
  ],
};

export const ProductRegistryDefinition: RegisteredComponent = {
  component: Product,
  name: "Product",
  inputs: [
    {
      name: "manufacturer",
      friendlyName: "Manufacturer",
      type: "text",
      required: true,
    },
    {
      name: "name",
      friendlyName: "Name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      friendlyName: "Description",
      type: "richText",
      required: false,
    },
    {
      name: "officialUrl",
      friendlyName: "Official URL",
      type: "url",
      required: false,
    },
    {
      name: "imageUrl",
      friendlyName: "Image URL",
      type: "file",

      required: true,
    },
    {
      name: "category",
      friendlyName: "Category",
      type: "text",
      enum: Object.values(ProductCategory),
      required: true,
    },
    {
      name: "technicalSpecs",
      friendlyName: "Technical Specifications",
      type: "object",
      required: false,
      subFields: [
        {
          name: "generic",
          friendlyName: "Generic",
          type: "array",
          required: false,
          subFields: [
            {
              name: "name",
              friendlyName: "Name",
              type: "text",
              required: true,
            },
            {
              name: "value",
              friendlyName: "Value",
              type: "text",
              required: true,
            },
          ],
        },
        {
          name: "flightController",
          friendlyName: "Flight Controller",
          type: "object",
          required: false,
          subFields: [
            {
              name: "processor",
              friendlyName: "Processor",
              type: "text",
              enum: Object.values(ProductFlightControllerProcessor),
              required: true,
            },
            {
              name: "gyro",
              friendlyName: "Gyro",
              type: "text",
              enum: Object.values(ProductFlightControllerGyro),
              required: true,
            },
            mountingPatternInput,
            {
              name: "betaflightTarget",
              friendlyName: "Betaflight Target",
              type: "text",
              required: true,
            },
            {
              name: "usbType",
              friendlyName: "USB Type",
              type: "text",
              enum: Object.values(ProductFlightControllerUsbType),
              required: true,
            },
            {
              name: "hardwareUartCount",
              friendlyName: "Hardware UART Count",
              type: "number",
              required: true,
            },
            {
              name: "hardwareUartCountReserved",
              friendlyName: "Hardware UART Count Reserved",
              type: "number",
              required: true,
            },
            {
              name: "ledStripPadCount",
              friendlyName: "LED Strip Pad Count",
              type: "number",
              required: true,
            },
            {
              name: "blackboxType",
              friendlyName: "Blackbox Type",
              type: "text",
              enum: Object.values(ProductFlightControllerBlackboxType),
              required: true,
            },
            {
              name: "blackboxSizeInMb",
              friendlyName: "Blackbox Size (MB)",
              type: "number",
              required: false,
            },
            {
              name: "analogOsdChip",
              friendlyName: "Analog OSD Chip",
              type: "boolean",
              required: false,
            },
            {
              name: "onboardBarometer",
              friendlyName: "Onboard Barometer",
              type: "boolean",
              required: false,
            },
            {
              name: "onboardCompass",
              friendlyName: "Onboard Compass",
              type: "boolean",
              required: false,
            },
            {
              name: "motorOutputs",
              friendlyName: "Motor Outputs",
              type: "number",
              required: true,
            },
            {
              name: "onboardRx",
              friendlyName: "Onboard RX",
              type: "text",
              enum: Object.values(ProductFlightControllerOnboardRx),
              required: true,
            },
            {
              name: "onboardVtx",
              friendlyName: "Onboard VTX",
              type: "text",
              enum: Object.values(ProductFlightControllerOnboardVtx),
              required: true,
            },
            {
              name: "onboardVtxPower",
              friendlyName: "Onboard VTX Power",
              type: "number",
              required: false,
            },
          ],
        },
        {
          name: "esc",
          friendlyName: "ESC",
          type: "object",
          required: false,
          subFields: [
            {
              name: "firmware",
              friendlyName: "Firmware",
              type: "text",
              enum: Object.values(ProductESCFirmware),
              required: true,
            },
            {
              name: "firmwareTarget",
              friendlyName: "Firmware Target",
              type: "text",
              required: false,
            },
            {
              name: "continuousCurrentInA",
              friendlyName: "Continuous Current (A)",
              type: "number",
              required: true,
            },
            {
              name: "burstCurrentInA",
              friendlyName: "Burst Current (A)",
              type: "number",
              required: true,
            },
            {
              name: "tvsProtectiveDiode",
              friendlyName: "TVS Protective Diode",
              type: "boolean",
              required: false,
            },
            {
              name: "powerInputMinVoltage",
              friendlyName: "Power Input Min Voltage",
              type: "number",
              required: false,
            },
            {
              name: "powerInputMinS",
              friendlyName: "Power Input Min (Lipo Cell Count)",
              type: "number",
              required: false,
            },
            {
              name: "powerInputMaxVoltage",
              friendlyName: "Power Input Max Voltage",
              type: "number",
              required: false,
            },
            {
              name: "powerInputMaxS",
              friendlyName: "Power Input Max (Lipo Cell Count)",
              type: "number",
              required: false,
            },
            mountingPatternInput,
          ],
        },
      ],
    },
    {
      name: "manuals",
      friendlyName: "Manuals",
      type: "array",
      required: false,
      subFields: [
        {
          name: "label",
          friendlyName: "Label",
          type: "text",
          required: true,
        },
        {
          name: "image",
          friendlyName: "Image of Manual",
          type: "file",
          allowedFileTypes: ["jpeg", "png", "jpg", "svg", "gif", "webp"],
          required: false,
        },
        {
          name: "pdf",
          friendlyName: "PDF of Manual",
          type: "file",
          allowedFileTypes: ["pdf"],
          required: false,
        },
      ],
    },
  ],
};
