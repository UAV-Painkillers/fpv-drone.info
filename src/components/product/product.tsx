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

interface TechnicalSpecsFlightController {
  processor: ProductFlightControllerProcessor;
  gyro: ProductFlightControllerGyro;
  mountingPattern: {
    m2_20x20: boolean;
    m2_25x25: boolean;
    m2_30x30: boolean;
    m3_20x20: boolean;
    m3_25x25: boolean;
    m3_30x30: boolean;
  };
  betaflightTarget: string;
  hardwareUartCount: number;
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
  };
  manuals?: Array<{ label: string; pdf?: string; image?: string }>;
}

export const Product = component$((props: ProductProps) => {
  const descriptionHtml = formatHtmlText(props.description ?? "");

  const hasGenericTechnicalSpecs =
    (props.technicalSpecs?.generic?.length ?? 0) > 0;

  const hasFlightControllerTechnicalSpecs = Object.values(
    props.technicalSpecs?.flightController ?? {},
  ).some((v) => v !== undefined || v !== null);

  const hasTechnicalSpecs =
    hasGenericTechnicalSpecs || hasFlightControllerTechnicalSpecs;

  const hasMoreThanOneTechnicalSpecsSection =
    hasGenericTechnicalSpecs && hasFlightControllerTechnicalSpecs;

  function specKeyToInputFriendlyName(key: string): string {
    const mainInputs = ProductRegistryDefinition.inputs!.find(
      (input) => input.name === "technicalSpecs",
    )!.subFields!.find(
      (subField) => subField.name === "flightController",
    )!.subFields!;

    const keyParts = key.split(".");
    const firstKeyPart = keyParts.shift()!;
    let parentInput = mainInputs.find((input) => input.name === firstKeyPart);
    if (!parentInput) {
      return key;
    }

    while (keyParts.length > 0) {
      const nextKeyPart = keyParts.shift()!;
      parentInput = parentInput.subFields!.find(
        (input) => input.name === nextKeyPart,
      );
      if (!parentInput) {
        return key;
      }
    }

    return parentInput.friendlyName ?? key;
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

    Object.entries(props.technicalSpecs!.flightController!).forEach(
      ([key, value]) => {
        // combine all mountingPattern inputs into one row
        if (key === "mountingPattern") {
          const acceptedPatterns = Object.entries(
            value as Record<string, boolean>,
          )
            .filter(([, value]) => value)
            .map(([key]) =>
              specKeyToInputFriendlyName("mountingPattern." + key),
            );

          if (acceptedPatterns.length === 0) {
            return;
          }

          const friendlyKeyName = specKeyToInputFriendlyName(key);
          const combinedValue = acceptedPatterns.join(", ");
          flightControllerTechnicalSpecsTableData.push({
            __isHeadline__: false,
            specification: friendlyKeyName,
            value: combinedValue,
          });
          return;
        }

        flightControllerTechnicalSpecsTableData.push({
          __isHeadline__: false,
          specification: specKeyToInputFriendlyName(key),
          value: value as string,
        });
      },
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

  return (
    <div>
      <PageHeadline title={props.manufacturer} subtitle={props.name} />
      <section>
        <div>
          <small>Category: {props.category}</small>
          {props.officialUrl && (
            <Link href={props.officialUrl} target="_blank" class="anchor">
              Official Website
            </Link>
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

          {hasFlightControllerTechnicalSpecs && (
            <Table
              columns={specTableColumns}
              data={flightControllerTechnicalSpecsTableData}
              showColumnHeaders={!hasMoreThanOneTechnicalSpecsSection}
            />
          )}

          {hasGenericTechnicalSpecs && (
            <Table
              columns={specTableColumns}
              data={genericTechnicalSpecsTableData}
              showColumnHeaders={!hasMoreThanOneTechnicalSpecsSection}
            />
          )}
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
            {
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
                  name: "m2_30x30",
                  friendlyName: "M2 30x30",
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
                  name: "m3_30x30",
                  friendlyName: "M3 30x30",
                  type: "boolean",
                  required: false,
                },
              ],
            },
            {
              name: "betaflightTarget",
              friendlyName: "Betaflight Target",
              type: "text",
              required: true,
            },
            {
              name: "hardwareUartCount",
              friendlyName: "Hardware UART Count",
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
