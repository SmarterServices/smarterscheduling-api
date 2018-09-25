CREATE OR REPLACE FUNCTION %schemaName%.fn_get_appointment_availability(calendarsid character varying, startdatetime timestamp without time zone, enddatetime timestamp without time zone, requestedduration integer)
 RETURNS TABLE("startDateTime" timestamp without time zone, "endDateTime" timestamp without time zone, "seatCount" integer, duration integer)
 LANGUAGE plpgsql
AS $function$


BEGIN



 RETURN QUERY

  SELECT '2018-09-22 22:00:00.000000'::timestamp without time zone, '2018-09-22 23:00:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 22:15:00.000000'::timestamp without time zone, '2018-09-22 23:15:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 22:30:00.000000'::timestamp without time zone, '2018-09-22 23:30:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 22:45:00.000000'::timestamp without time zone, '2018-09-22 23:45:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 23:00:00.000000'::timestamp without time zone, '2018-09-22 24:00:00.000000'::timestamp without time zone, 2, $4;

 END
$function$
